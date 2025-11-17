"""
Speaking Router - Speaking practice and pronunciation evaluation
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from models.schemas import ReadAloudResponse, AccuracyDetails
from services import openai_service, accuracy_service
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["speaking"]
)


@router.post("/speaking/read-aloud", response_model=ReadAloudResponse)
async def check_read_aloud(
    audio: UploadFile = File(..., description="Audio file (webm, mp3, wav)"),
    expected_text: str = Form(..., description="The text the user should read"),
    language: str = Form(default="en", description="Language code")
):
    """
    Evaluate read-aloud pronunciation

    This endpoint:
    1. Transcribes user's audio using Whisper
    2. Calculates word-level accuracy
    3. Gets AI feedback on pronunciation
    4. Returns hybrid score combining both metrics

    Supported audio formats: webm, mp3, wav, m4a
    """
    try:
        logger.info(f"Read-aloud check - Expected: '{expected_text[:50]}...', Audio: {audio.filename}")

        # Step 1: Transcribe audio using Whisper
        transcript = await openai_service.transcribe_audio(
            file=audio,
            language=language
        )
        logger.info(f"Transcript: '{transcript}'")

        # Step 2: Calculate word accuracy
        word_accuracy, details = accuracy_service.calculate_word_accuracy(
            expected_text=expected_text,
            spoken_text=transcript,
            ignore_fillers=True
        )
        logger.info(f"Word accuracy: {word_accuracy}%")

        # Step 3: Generate bilingual AI feedback (EN + VI)
        feedback_en, feedback_vi, tricky_words = await openai_service.generate_bilingual_feedback(
            expected_text=expected_text,
            spoken_text=transcript,
            word_accuracy=word_accuracy,
            accuracy_details=details
        )
        logger.info(f"Bilingual feedback - EN: '{feedback_en[:50]}...', VI: '{feedback_vi[:50]}...'")

        # Step 4: Generate TTS for both feedbacks
        try:
            # English TTS
            tts_en_path = await openai_service.generate_speech(
                text=feedback_en,
                voice="nova"  # English voice
            )
            tts_en_url = f"/media/{Path(tts_en_path).name}"
            logger.info(f"EN TTS generated: {tts_en_url}")
        except Exception as e:
            logger.error(f"Error generating EN TTS: {e}")
            tts_en_url = None

        try:
            # Vietnamese TTS (OpenAI TTS supports Vietnamese with 'alloy' voice)
            tts_vi_path = await openai_service.generate_speech(
                text=feedback_vi,
                voice="alloy"  # Works for Vietnamese
            )
            tts_vi_url = f"/media/{Path(tts_vi_path).name}"
            logger.info(f"VI TTS generated: {tts_vi_url}")
        except Exception as e:
            logger.error(f"Error generating VI TTS: {e}")
            tts_vi_url = None

        # Step 5: Calculate hybrid score
        ai_score_estimate = word_accuracy
        overall_score = accuracy_service.calculate_hybrid_score(
            word_accuracy=word_accuracy,
            ai_score=ai_score_estimate,
            word_weight=0.7,
            ai_weight=0.3
        )

        # Determine emotion tag
        if overall_score >= 85:
            emotion_tag = "praise"
        elif overall_score >= 70:
            emotion_tag = "encouraging"
        else:
            emotion_tag = "corrective"

        # Build accuracy details
        accuracy_details_obj = AccuracyDetails(
            word_accuracy=word_accuracy,
            wer=details.get("wer", 1.0),
            matches=details.get("matches", 0),
            substitutions=details.get("substitutions", 0),
            insertions=details.get("insertions", 0),
            deletions=details.get("deletions", 0),
            expected_words=details.get("expected_words", []),
            spoken_words=details.get("spoken_words", [])
        )

        # Legacy combined feedback
        ai_feedback_combined = f"{feedback_en} {feedback_vi}"

        return ReadAloudResponse(
            transcript=transcript,
            expected_text=expected_text,
            word_accuracy=word_accuracy,
            ai_feedback=ai_feedback_combined,  # Legacy field
            overall_score=overall_score,
            emotion_tag=emotion_tag,
            accuracy_details=accuracy_details_obj,
            feedback_en=feedback_en,
            feedback_vi=feedback_vi,
            tts_en_url=tts_en_url,
            tts_vi_url=tts_vi_url,
            tricky_words=tricky_words,
            tts_url=None
        )

    except Exception as e:
        logger.error(f"Error in check_read_aloud: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate pronunciation: {str(e)}"
        )


@router.post("/speaking/free-speak")
async def check_free_speaking(
    audio: UploadFile = File(..., description="Audio file"),
    context: Optional[str] = Form(default=None, description="Conversation context"),
    language: str = Form(default="en", description="Language code")
):
    """
    Evaluate free-form speaking (future feature)

    This will be used for Speaking Chat mode where user has
    natural conversation with Coach Ivy
    """
    try:
        # Step 1: Transcribe
        transcript = await openai_service.transcribe_audio(
            file=audio,
            language=language
        )

        # Step 2: Get conversational response from Coach Ivy
        reply, emotion_tag = await openai_service.chat_with_coach(
            message=transcript,
            mode="free_chat",
            context={"type": "speaking_practice", "context": context} if context else None
        )

        return {
            "transcript": transcript,
            "reply": reply,
            "emotion_tag": emotion_tag,
            "tts_url": None
        }

    except Exception as e:
        logger.error(f"Error in check_free_speaking: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process speech: {str(e)}"
        )
