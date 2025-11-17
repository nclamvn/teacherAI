"""
User Progress Router - Track weak words, saved phrases, and learning progress
For localStorage-based user data (ready for database migration)
"""
from fastapi import APIRouter, HTTPException, Form
from models.schemas import WeakWord, SavedPhrase, UserProgress
from typing import List, Optional
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/user",
    tags=["user-progress"]
)


@router.post("/save-weak-word")
async def save_weak_word(
    user_id: str = Form(...),
    word: str = Form(...),
    error_type: str = Form(...),
    error_count: int = Form(default=1),
    last_practiced: str = Form(...)
):
    """
    Save a word that user struggles with

    Currently returns success (frontend handles localStorage).
    Ready for database integration.

    Args:
        user_id: User identifier
        word: The problematic word
        error_type: Type of error (substitution, deletion, mispronunciation)
        error_count: Number of times mispronounced
        last_practiced: ISO timestamp

    Returns:
        Success confirmation
    """
    logger.info(f"Saving weak word for user {user_id}: {word} ({error_type})")

    # Validate error_type
    valid_types = ["substitution", "deletion", "mispronunciation"]
    if error_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid error_type. Must be one of: {valid_types}"
        )

    # In localStorage approach, frontend handles actual storage
    # This endpoint is here for API consistency and future database integration
    return {
        "saved": True,
        "word": word,
        "user_id": user_id,
        "message": "Weak word recorded successfully"
    }


@router.get("/weak-words")
async def get_weak_words(
    user_id: str,
    limit: int = 5
):
    """
    Get user's weak words for focused practice

    Currently instructs frontend to use localStorage aggregation.
    Ready for database implementation.

    Args:
        user_id: User identifier
        limit: Maximum number of weak words to return

    Returns:
        Message to use frontend localStorage (for now)
    """
    logger.info(f"Fetching weak words for user {user_id}")

    # With localStorage approach, frontend aggregates the data
    # This endpoint is prepared for future database implementation
    return {
        "message": "Use frontend localStorage aggregation",
        "user_id": user_id,
        "limit": limit,
        "note": "This endpoint will return actual data when database is integrated"
    }


@router.post("/save-phrase")
async def save_phrase(
    user_id: str = Form(...),
    phrase: str = Form(...),
    source: str = Form(...),
    topic: str = Form(...),
    saved_at: str = Form(...)
):
    """
    Save a phrase to user's personal bank

    Args:
        user_id: User identifier
        phrase: The phrase to save
        source: Where it came from (e.g., 'lesson_1', 'live_talk_travel')
        topic: Topic category (food, travel, work, etc.)
        saved_at: ISO timestamp when saved

    Returns:
        Success confirmation
    """
    logger.info(f"Saving phrase for user {user_id}: '{phrase[:50]}...' (topic: {topic})")

    if not phrase.strip():
        raise HTTPException(
            status_code=400,
            detail="Phrase cannot be empty"
        )

    # Frontend handles localStorage for now
    # This endpoint ensures API consistency for future database
    return {
        "saved": True,
        "phrase": phrase,
        "topic": topic,
        "source": source,
        "user_id": user_id,
        "message": "Phrase saved to bank successfully"
    }


@router.get("/phrases")
async def get_phrases(
    user_id: str,
    topic: Optional[str] = None
):
    """
    Get user's saved phrases, optionally filtered by topic

    Args:
        user_id: User identifier
        topic: Optional topic filter (food, travel, work, etc.)

    Returns:
        Message to use frontend localStorage (for now)
    """
    logger.info(f"Fetching phrases for user {user_id}, topic: {topic}")

    return {
        "message": "Use frontend localStorage",
        "user_id": user_id,
        "topic_filter": topic,
        "note": "This endpoint will return actual phrases when database is integrated"
    }


@router.get("/progress")
async def get_user_progress(user_id: str):
    """
    Get aggregate user progress data

    Returns all weak words, saved phrases, and session count.
    Currently instructs frontend to aggregate from localStorage.

    Args:
        user_id: User identifier

    Returns:
        Message to use frontend aggregation
    """
    logger.info(f"Fetching progress for user {user_id}")

    return {
        "message": "Use frontend localStorage aggregation",
        "user_id": user_id,
        "note": "This endpoint will return full UserProgress when database is integrated"
    }
