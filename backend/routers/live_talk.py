"""
Live Talk Router - Free conversation with AI Coach (Ivy/Leo)
Real-time voice conversation with gentle corrections and natural flow
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.schemas import (
    LiveTalkResponse,
    LiveTalkMessage,
    LiveTalkSessionStats,
    LiveTalkMission,
    SessionSummary
)
from services import openai_service
from pathlib import Path
import logging
import json
from typing import Optional, List

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/live-talk",
    tags=["live-talk"]
)

# ===== COACH PERSONAS FOR LIVE TALK =====

COACH_PERSONAS = {
    "ivy": {
        "system_prompt": """You are Coach Ivy, a warm and encouraging English conversation partner for Vietnamese learners.

**Your teaching style:**
- Friendly, patient, and supportive
- Use simple, natural English (beginner-friendly vocabulary)
- Keep responses SHORT (1-3 sentences maximum)
- Occasionally (not always!) gently correct errors by reformulating
- Ask follow-up questions to keep the conversation flowing
- Focus on practical, everyday topics

**When correcting mistakes:**
- Don't point out every error - be selective (only major errors)
- Use positive framing: "A more natural way to say that is..."
- Only correct issues that affect understanding
- Never lecture or overwhelm the learner

**Example correction:**
User: "I very like coffee"
You: "That's great! We usually say 'I really like coffee.' So, what's your favorite kind of coffee?"

**Important:**
- Stay conversational and warm - like chatting with a supportive friend
- Celebrate effort and progress
- Keep it light and encouraging""",
        "voice": "nova"  # Warm female voice for TTS
    },

    "leo": {
        "system_prompt": """You are Coach Leo, a casual and friendly English conversation partner for Vietnamese learners.

**Your teaching style:**
- Relaxed, easygoing, conversational
- Use everyday, natural English
- Keep responses SHORT (1-3 sentences maximum)
- Occasionally gently correct errors in a friendly, casual way
- Share brief personal anecdotes to keep it interesting
- Encourage learners to speak more

**When correcting mistakes:**
- Be casual and friendly about it
- Use phrases like: "By the way, we usually say..."
- Don't overcorrect - keep the conversation flowing naturally
- Focus on helping, not teaching

**Example correction:**
User: "Yesterday I go to market"
You: "Cool! By the way, we'd say 'I went to the market.' What did you buy there?"

**Important:**
- Stay casual, friendly, and fun
- Make the learner feel comfortable
- Keep conversations natural and engaging""",
        "voice": "echo"  # Casual male voice for TTS
    }
}

# ===== TOPIC CONTEXT HINTS =====

TOPIC_CONTEXTS = {
    "daily_life": "The conversation is about daily routines, hobbies, and everyday activities.",
    "travel": "The conversation is about travel experiences, plans, and destinations.",
    "work": "The conversation is about work, career, and professional life.",
    "hobbies": "The conversation is about personal interests, hobbies, and free time activities."
}

# ===== TOPIC MISSIONS (for goal-oriented practice) =====

TOPIC_MISSIONS = {
    "daily_life": {
        "mission": "Talk about what you did yesterday",
        "focus_grammar": "Past simple: went, did, bought, saw, ate",
        "sample_phrases": [
            "I went to the market",
            "I bought some vegetables",
            "It was a nice day"
        ],
        "icon": "coffee"
    },
    "travel": {
        "mission": "Describe a place you want to visit",
        "focus_grammar": "Future: will, going to",
        "sample_phrases": [
            "I will visit Japan next year",
            "I'm going to see Mt. Fuji",
            "I want to try sushi there"
        ],
        "icon": "plane"
    },
    "work": {
        "mission": "Talk about your typical workday",
        "focus_grammar": "Present simple: do, work, have, finish",
        "sample_phrases": [
            "I work from 9 to 5",
            "I usually have meetings",
            "My job is interesting"
        ],
        "icon": "briefcase"
    },
    "hobbies": {
        "mission": "Share your favorite hobby or activity",
        "focus_grammar": "Present continuous: I'm learning, I enjoy",
        "sample_phrases": [
            "I enjoy reading books",
            "I'm learning guitar",
            "I like watching movies"
        ],
        "icon": "film"
    }
}


@router.post("/turn", response_model=LiveTalkResponse)
async def live_talk_turn(
    audio: UploadFile = File(..., description="User's voice audio"),
    user_id: str = Form(..., description="User ID"),
    coach_id: str = Form(default="ivy", description="Coach ID (ivy or leo)"),
    topic: Optional[str] = Form(default=None, description="Conversation topic context"),
    history: str = Form(default="[]", description="JSON array of conversation history")
):
    """
    Handle one turn of live conversation

    Process flow:
    1. Transcribe user's audio (STT)
    2. Build conversation context with coach persona
    3. Get AI response from ChatGPT
    4. Generate TTS audio for response
    5. Calculate session stats
    6. Return response with audio URL

    Args:
        audio: Audio file from user (webm, mp3, wav)
        user_id: User identifier
        coach_id: Coach to talk with (ivy or leo)
        topic: Optional topic context (daily_life, travel, work, hobbies)
        history: JSON string of previous messages [{"role": "user", "content": "..."}]

    Returns:
        LiveTalkResponse with transcription, AI response, audio URL, and stats
    """
    try:
        logger.info(f"Live Talk turn - user: {user_id}, coach: {coach_id}, topic: {topic}")

        # Step 1: Transcribe user audio using Whisper STT
        user_text = await openai_service.transcribe_audio(
            file=audio,
            language="en"
        )

        if not user_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not transcribe audio. Please try speaking again."
            )

        logger.info(f"User said: '{user_text}'")

        # Step 2: Parse conversation history
        try:
            messages = json.loads(history)
        except json.JSONDecodeError:
            logger.warning("Invalid history JSON, starting fresh")
            messages = []

        # Step 3: Build ChatGPT prompt with coach persona
        coach = COACH_PERSONAS.get(coach_id, COACH_PERSONAS["ivy"])

        system_prompt = coach["system_prompt"]

        # Add topic context if provided
        if topic and topic in TOPIC_CONTEXTS:
            system_prompt += f"\n\n**Current topic context:** {TOPIC_CONTEXTS[topic]}"

        # Build message array for ChatGPT
        chat_messages = [{"role": "system", "content": system_prompt}]
        chat_messages.extend(messages)
        chat_messages.append({"role": "user", "content": user_text})

        # Step 4: Call ChatGPT for coach response
        response = client.chat.completions.create(
            model="gpt-4",
            messages=chat_messages,
            max_tokens=150,  # Keep responses short
            temperature=0.7  # Natural but not too random
        )

        assistant_text = response.choices[0].message.content.strip()
        logger.info(f"Coach {coach_id} replied: '{assistant_text[:100]}...'")

        # Step 5: Generate TTS for coach's response
        tts_voice = coach["voice"]
        tts_path = await openai_service.generate_speech(
            text=assistant_text,
            voice=tts_voice
        )
        audio_url = f"/media/{Path(tts_path).name}"

        # Step 6: Calculate session statistics
        turn_count = len([m for m in messages if m["role"] == "user"]) + 1
        word_count = sum(
            len(m["content"].split())
            for m in messages
            if m["role"] == "user"
        )
        word_count += len(user_text.split())

        session_stats = LiveTalkSessionStats(
            turn_count=turn_count,
            word_count=word_count,
            duration_minutes=0  # Frontend will calculate duration
        )

        logger.info(f"Session stats - turns: {turn_count}, words: {word_count}")

        return LiveTalkResponse(
            user_text=user_text,
            assistant_text=assistant_text,
            audio_url=audio_url,
            correction=None,  # Corrections are embedded in assistant_text
            session_stats=session_stats
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in live_talk_turn: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process conversation turn: {str(e)}"
        )


@router.get("/mission", response_model=LiveTalkMission)
async def get_mission(topic: str = "daily_life"):
    """
    Get mission definition for a specific topic

    Returns mission description, focus grammar, and sample phrases
    to guide the user's practice session.

    Args:
        topic: Topic ID (daily_life, travel, work, hobbies)

    Returns:
        LiveTalkMission with mission details
    """
    if topic not in TOPIC_MISSIONS:
        logger.warning(f"Unknown topic: {topic}, defaulting to daily_life")
        topic = "daily_life"

    mission_data = TOPIC_MISSIONS[topic]

    return LiveTalkMission(
        mission=mission_data["mission"],
        focus_grammar=mission_data["focus_grammar"],
        sample_phrases=mission_data["sample_phrases"],
        icon=mission_data["icon"]
    )


@router.post("/end-session", response_model=SessionSummary)
async def end_live_talk_session(
    history: str = Form(..., description="JSON array of conversation messages"),
    topic: str = Form(..., description="Conversation topic"),
    user_id: str = Form(..., description="User ID")
):
    """
    Generate AI summary for completed Live Talk session

    Analyzes the conversation to provide:
    - What went well (strengths)
    - Common mistakes (weaknesses)
    - Good example sentences the user said
    - Practice suggestion for improvement

    Args:
        history: JSON string of conversation messages
        topic: Topic that was discussed
        user_id: User identifier

    Returns:
        SessionSummary with AI-generated feedback
    """
    try:
        logger.info(f"Generating session summary - user: {user_id}, topic: {topic}")

        # Parse conversation history
        try:
            messages = json.loads(history)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=400,
                detail="Invalid history JSON format"
            )

        if not messages:
            raise HTTPException(
                status_code=400,
                detail="Cannot generate summary for empty conversation"
            )

        # Get mission context
        mission = TOPIC_MISSIONS.get(topic, TOPIC_MISSIONS["daily_life"])

        # Format conversation for analysis
        conversation_text = "\n".join([
            f"{msg['role'].upper()}: {msg['content']}"
            for msg in messages
        ])

        # Build analysis prompt
        analysis_prompt = f"""You are analyzing a Live Talk conversation session for an English learner.

Topic: {topic}
Mission: {mission['mission']}
Focus Grammar: {mission['focus_grammar']}

Conversation:
{conversation_text}

Please provide a supportive and encouraging analysis in JSON format:

{{
  "strengths": "1-2 short sentences about what the user did well",
  "weaknesses": "1-2 patterns of mistakes, phrased gently and encouragingly",
  "good_sentences": ["sentence 1 the user said well (copy verbatim)", "sentence 2"],
  "practice_suggestion": "1 specific sentence pattern they should practice more"
}}

Be very encouraging and supportive. Focus on progress, not perfection."""

        # Call GPT for analysis
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a supportive English teacher analyzing student conversation practice."
                },
                {"role": "user", "content": analysis_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )

        summary_data = json.loads(response.choices[0].message.content)
        logger.info(f"Summary generated: {summary_data}")

        # Calculate session stats
        user_turns = [m for m in messages if m["role"] == "user"]
        total_words = sum(len(turn["content"].split()) for turn in user_turns)

        return SessionSummary(
            turns=len(user_turns),
            total_words=total_words,
            duration_minutes=0,  # Frontend calculates this
            strengths=summary_data.get("strengths", "Great effort in practicing!"),
            weaknesses=summary_data.get("weaknesses", "Keep practicing to build fluency."),
            good_sentences=summary_data.get("good_sentences", []),
            practice_suggestion=summary_data.get("practice_suggestion", "Keep practicing daily conversations.")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating session summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate session summary: {str(e)}"
        )


# Import OpenAI client at module level (after openai_service is imported)
from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.openai_api_key)
