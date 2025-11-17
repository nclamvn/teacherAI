"""
Chat Router - Endpoints for chatting with Coach Ivy
"""
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services import openai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["chat"]
)


@router.post("/chat-teacher", response_model=ChatResponse)
async def chat_with_teacher(request: ChatRequest):
    """
    Chat with Coach Ivy - Your personal English teacher

    This endpoint allows free-form conversation with the AI teacher.
    Use different modes for different types of interactions.

    Modes:
    - free_chat: General conversation practice
    - explain: Ask for explanations of concepts
    - speaking_feedback: Get feedback on your speaking
    """
    try:
        logger.info(f"Chat request - mode: {request.mode}, message: {request.message[:50]}...")

        # Call OpenAI service
        reply, emotion_tag = await openai_service.chat_with_coach(
            message=request.message,
            mode=request.mode,
            context=request.context
        )

        # Optionally generate TTS (for now, we'll leave it None)
        # In the future, we can add TTS generation here if needed
        tts_url = None

        return ChatResponse(
            reply=reply,
            emotion_tag=emotion_tag,
            tts_url=tts_url
        )

    except Exception as e:
        logger.error(f"Error in chat_with_teacher: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process chat request"
        )
