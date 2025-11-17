"""
Media Router - Serve static media files (audio, images, etc.)
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# No prefix for media router - serves directly from /media
router = APIRouter(
    tags=["media"]
)


@router.get("/media/{filename}")
async def get_media_file(filename: str):
    """
    Serve media files (audio files)

    This endpoint serves the generated audio files
    """
    try:
        media_path = Path("media/tts") / filename

        if not media_path.exists():
            logger.error(f"Media file not found: {media_path}")
            raise HTTPException(status_code=404, detail="Audio file not found")

        return FileResponse(
            path=media_path,
            media_type="audio/mpeg",
            filename=filename
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving media file: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to serve audio file"
        )
