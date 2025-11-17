"""
TTS Router - Text-to-Speech endpoints using OpenAI TTS
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from models.schemas import TTSRequest, TTSResponse
from services import openai_service
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["tts"]
)


@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """
    Generate speech from text using OpenAI TTS

    This endpoint converts text to speech and returns the audio file path.
    Results are cached - same text with same voice will return cached audio.

    Available voices: alloy, echo, fable, onyx, nova, shimmer
    """
    try:
        logger.info(f"TTS request - text: {request.text[:50]}..., voice: {request.voice}")

        # Generate speech
        audio_path = await openai_service.generate_speech(
            text=request.text,
            voice=request.voice
        )

        # Convert absolute path to URL-friendly path
        # For now, return the relative path that frontend can fetch
        audio_url = f"/media/{Path(audio_path).name}"

        return TTSResponse(
            audio_url=audio_url,
            text=request.text
        )

    except Exception as e:
        logger.error(f"Error in text_to_speech: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate speech"
        )


# Media serving moved to routers/media.py
