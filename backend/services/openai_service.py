"""
OpenAI Service - ChatGPT & TTS Integration
Coach Ivy: Your personal English companion
"""
import logging
from openai import OpenAI
from config import settings
from pathlib import Path
import hashlib
import tempfile
import os
from typing import Literal, Optional
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)

# ===== COACH IVY SYSTEM PROMPTS =====

COACH_IVY_BASE_PROMPT = """You are "Coach Ivy", a personal English tutor for a Vietnamese learner.

**Personality:**
- Friendly, encouraging, and supportive
- Patient and understanding
- Enthusiastic about progress
- Professional but warm

**Communication style:**
- Use English for teaching and examples
- Use short Vietnamese explanations when concepts are complex
- Keep responses concise (2-4 sentences for most cases)
- Always be positive and motivating

**Teaching approach:**
- Focus on practical usage
- Provide real-world examples
- Explain "why" not just "what"
- Encourage practice and repetition
- Celebrate small wins
"""

MODE_PROMPTS = {
    "free_chat": """The user is having a casual conversation to practice English.
- Answer their questions naturally
- Gently correct major errors
- Keep the conversation flowing
- Use this as a teaching opportunity when appropriate""",

    "explain": """The user needs help understanding an English concept, word, or phrase.
- Provide a clear explanation
- Give 2-3 practical examples
- Include Vietnamese translation for key terms
- Keep it simple and actionable""",

    "speaking_feedback": """The user just practiced speaking. Provide constructive feedback.
- Start with encouragement
- Point out what they did well
- Suggest ONE main improvement
- Provide the corrected version
- Give a similar example to practice"""
}


def get_system_prompt(mode: str = "free_chat") -> str:
    """Get complete system prompt for Coach Ivy"""
    mode_specific = MODE_PROMPTS.get(mode, MODE_PROMPTS["free_chat"])
    return f"{COACH_IVY_BASE_PROMPT}\n\n{mode_specific}"


# ===== CHATGPT FUNCTIONS =====

async def chat_with_coach(
    message: str,
    mode: str = "free_chat",
    context: Optional[dict] = None
) -> tuple[str, str]:
    """
    Chat with Coach Ivy

    Args:
        message: User's message
        mode: Conversation mode (free_chat, explain, speaking_feedback)
        context: Additional context (lesson_id, level, etc.)

    Returns:
        tuple: (reply_text, emotion_tag)
    """
    try:
        system_prompt = get_system_prompt(mode)

        # Add context to system prompt if provided
        if context:
            context_str = f"\n\nContext: {context}"
            system_prompt += context_str

        # Call ChatGPT
        response = client.chat.completions.create(
            model=settings.openai_model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=300
        )

        reply = response.choices[0].message.content.strip()

        # Determine emotion tag based on response content
        emotion_tag = _analyze_emotion(reply)

        logger.info(f"Coach Ivy replied (mode={mode}, emotion={emotion_tag})")
        return reply, emotion_tag

    except Exception as e:
        logger.error(f"Error in chat_with_coach: {e}")
        raise


def _analyze_emotion(text: str) -> str:
    """
    Analyze text to determine appropriate emotion tag for avatar

    Returns: neutral | praise | corrective | encouraging
    """
    text_lower = text.lower()

    # Praise indicators
    praise_words = ["excellent", "perfect", "great", "wonderful", "amazing", "fantastic", "correct", "well done", "good job", "tuyệt vời", "hoàn hảo"]
    if any(word in text_lower for word in praise_words):
        return "praise"

    # Corrective indicators
    corrective_words = ["however", "but", "correction", "should be", "mistake", "error", "incorrect", "sửa", "sai"]
    if any(word in text_lower for word in corrective_words):
        return "corrective"

    # Encouraging indicators
    encouraging_words = ["keep", "practice", "try", "don't worry", "no problem", "keep going", "tiếp tục", "cố lên"]
    if any(word in text_lower for word in encouraging_words):
        return "encouraging"

    return "neutral"


# ===== EXERCISE FEEDBACK =====

async def check_exercise_with_feedback(
    question: str,
    user_answers: list[str],
    correct_answers: list[str],
    exercise_type: str = "multiple_choice"
) -> tuple[bool, float, str, str]:
    """
    Check exercise and generate AI feedback

    Returns:
        tuple: (is_correct, score, feedback_text, emotion_tag)
    """
    try:
        # Calculate correctness
        is_correct = user_answers == correct_answers
        score = 100.0 if is_correct else 0.0

        # Generate AI feedback
        prompt = f"""The student answered this question:
Question: {question}
Their answer: {' '.join(user_answers)}
Correct answer: {' '.join(correct_answers)}

Provide brief feedback (2-3 sentences):
- If correct: praise and explain why it's right
- If incorrect: gently explain the mistake and provide the correct answer with reasoning"""

        response = client.chat.completions.create(
            model=settings.openai_model_name,
            messages=[
                {"role": "system", "content": get_system_prompt("explain")},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        feedback = response.choices[0].message.content.strip()
        emotion_tag = "praise" if is_correct else "corrective"

        logger.info(f"Exercise checked: correct={is_correct}, score={score}")
        return is_correct, score, feedback, emotion_tag

    except Exception as e:
        logger.error(f"Error in check_exercise_with_feedback: {e}")
        raise


# ===== TTS FUNCTIONS =====

# Directory for storing TTS audio files
MEDIA_DIR = Path("media/tts")
MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def _get_audio_hash(text: str, voice: str) -> str:
    """Generate unique hash for text + voice combination"""
    content = f"{text}_{voice}"
    return hashlib.md5(content.encode()).hexdigest()


async def generate_speech(
    text: str,
    voice: Optional[str] = None
) -> str:
    """
    Generate speech from text using OpenAI TTS

    Args:
        text: Text to convert to speech
        voice: Voice to use (default from settings)

    Returns:
        str: Path to audio file
    """
    try:
        if not voice:
            voice = settings.openai_tts_voice

        # Check cache
        audio_hash = _get_audio_hash(text, voice)
        audio_path = MEDIA_DIR / f"{audio_hash}.mp3"

        # Return cached file if exists
        if audio_path.exists():
            logger.info(f"TTS cache hit for: {text[:50]}...")
            return str(audio_path)

        # Generate new audio
        logger.info(f"Generating TTS for: {text[:50]}...")
        response = client.audio.speech.create(
            model=settings.openai_tts_model,
            voice=voice,
            input=text,
            response_format="mp3"
        )

        # Save to file
        response.stream_to_file(audio_path)
        logger.info(f"TTS saved to: {audio_path}")

        return str(audio_path)

    except Exception as e:
        logger.error(f"Error in generate_speech: {e}")
        raise


# ===== WHISPER (SPEECH-TO-TEXT) FUNCTIONS =====

async def transcribe_audio(
    file: UploadFile,
    language: str = "en"
) -> str:
    """
    Transcribe audio file to text using OpenAI Whisper

    Args:
        file: Audio file (webm, mp3, wav, etc.)
        language: Language code (default: "en" for English)

    Returns:
        str: Transcribed text
    """
    temp_file_path = None
    try:
        # Create temp file with appropriate extension
        file_extension = Path(file.filename).suffix or ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file_path = temp_file.name

            # Write uploaded file to temp location
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()

        logger.info(f"Transcribing audio file: {file.filename} ({len(content)} bytes)")

        # Call Whisper API
        with open(temp_file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="text"
            )

        transcript = response.strip() if isinstance(response, str) else response.text.strip()
        logger.info(f"Transcription complete: {transcript[:100]}...")

        return transcript

    except Exception as e:
        logger.error(f"Error in transcribe_audio: {e}")
        raise

    finally:
        # Cleanup temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.debug(f"Cleaned up temp file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete temp file: {e}")


# ===== BILINGUAL FEEDBACK FUNCTIONS =====

async def generate_bilingual_feedback(
    expected_text: str,
    spoken_text: str,
    word_accuracy: float,
    accuracy_details: dict
) -> tuple[str, str, list[str]]:
    """
    Generate bilingual feedback (English + Vietnamese) for pronunciation practice

    Args:
        expected_text: The correct text
        spoken_text: What the user actually said
        word_accuracy: Word-level accuracy percentage
        accuracy_details: Detailed accuracy metrics

    Returns:
        tuple: (feedback_en, feedback_vi, tricky_words)
    """
    try:
        matches = accuracy_details.get('matches', 0)
        substitutions = accuracy_details.get('substitutions', 0)
        deletions = accuracy_details.get('deletions', 0)
        insertions = accuracy_details.get('insertions', 0)

        # Build prompt for bilingual feedback
        prompt = f"""The student practiced reading aloud in English.

Expected: "{expected_text}"
They said: "{spoken_text}"

Accuracy: {word_accuracy:.1f}%
- Correct words: {matches}
- Wrong words: {substitutions}
- Missing words: {deletions}
- Extra words: {insertions}

Generate TWO short feedback messages in JSON format:

1. "feedback_en": 1-2 sentences in simple English
   - Start with encouragement
   - If accuracy < 85%, mention 1 specific thing to improve
   - Keep it positive and actionable

2. "feedback_vi": 1-2 sentences in Vietnamese
   - Giải thích ngắn gọn về phát âm
   - Nếu có lỗi, chỉ ra cụ thể
   - Động viên học viên

3. "tricky_words": Array of 2-3 difficult words the student struggled with (English only)

Output ONLY valid JSON in this exact format:
{{
  "feedback_en": "...",
  "feedback_vi": "...",
  "tricky_words": ["word1", "word2"]
}}"""

        response = client.chat.completions.create(
            model=settings.openai_model_name,
            messages=[
                {"role": "system", "content": get_system_prompt("speaking_feedback")},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )

        response_text = response.choices[0].message.content.strip()

        # Parse JSON response
        import json
        try:
            # Try to extract JSON from response (handle cases where GPT adds markdown)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            data = json.loads(response_text)
            feedback_en = data.get("feedback_en", "Great job practicing!")
            feedback_vi = data.get("feedback_vi", "Tốt lắm! Tiếp tục luyện tập nhé.")
            tricky_words = data.get("tricky_words", [])

            logger.info(f"Bilingual feedback generated - EN: {len(feedback_en)} chars, VI: {len(feedback_vi)} chars")
            return feedback_en, feedback_vi, tricky_words

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from GPT: {e}")
            logger.error(f"Response was: {response_text}")
            # Fallback to simple feedback
            if word_accuracy >= 85:
                feedback_en = "Excellent pronunciation! Keep up the great work."
                feedback_vi = "Phát âm rất tốt! Tiếp tục như vậy nhé."
            elif word_accuracy >= 70:
                feedback_en = "Good job! Practice a bit more to improve your clarity."
                feedback_vi = "Khá tốt! Luyện thêm một chút để rõ ràng hơn."
            else:
                feedback_en = "Keep practicing! Focus on speaking slowly and clearly."
                feedback_vi = "Tiếp tục luyện tập! Hãy nói chậm và rõ ràng hơn."

            return feedback_en, feedback_vi, []

    except Exception as e:
        logger.error(f"Error in generate_bilingual_feedback: {e}")
        # Return safe defaults
        return "Great effort! Keep practicing.", "Cố gắng tốt! Tiếp tục luyện tập nhé.", []
