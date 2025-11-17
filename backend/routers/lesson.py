"""
Lesson Router - Endpoints for lesson management and exercise checking
"""
from fastapi import APIRouter, HTTPException
from models.schemas import ExerciseCheckRequest, ExerciseCheckResponse
from services import openai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/lesson",
    tags=["lesson"]
)


@router.post("/check-exercise", response_model=ExerciseCheckResponse)
async def check_exercise(request: ExerciseCheckRequest):
    """
    Check exercise answers and get AI-generated feedback

    This endpoint evaluates the user's answers against correct answers
    and uses ChatGPT to generate personalized feedback.
    """
    try:
        logger.info(f"Exercise check - lesson: {request.lesson_id}, type: {request.exercise_type}")

        # Use AI to generate feedback
        is_correct, score, feedback, emotion_tag = await openai_service.check_exercise_with_feedback(
            question=request.question or "Exercise question",
            user_answers=request.user_answers,
            correct_answers=request.correct_answers,
            exercise_type=request.exercise_type
        )

        # Optionally generate TTS for correct answer
        # For now, we'll leave it None
        tts_url = None

        return ExerciseCheckResponse(
            is_correct=is_correct,
            score=score,
            feedback=feedback,
            emotion_tag=emotion_tag,
            tts_url=tts_url
        )

    except Exception as e:
        logger.error(f"Error in check_exercise: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check exercise"
        )
