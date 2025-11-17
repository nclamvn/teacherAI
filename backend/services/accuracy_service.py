"""
Accuracy Service - Speech evaluation and word accuracy calculation
Uses difflib for text comparison and WER (Word Error Rate) calculation
"""
import re
import logging
from difflib import SequenceMatcher
from typing import Tuple, List, Dict

logger = logging.getLogger(__name__)

# Filler words to ignore in accuracy calculation
FILLER_WORDS = {
    "um", "uh", "er", "ah", "hmm", "like", "you know", "i mean",
    "well", "so", "actually", "basically", "literally"
}


def normalize_text(text: str) -> str:
    """
    Normalize text for comparison
    - Convert to lowercase
    - Remove punctuation except apostrophes
    - Remove extra whitespace
    - Keep contractions (don't, I'm, etc.)
    """
    # Convert to lowercase
    text = text.lower()

    # Remove punctuation except apostrophes (to preserve contractions)
    text = re.sub(r"[^\w\s']", "", text)

    # Remove extra whitespace
    text = " ".join(text.split())

    return text


def remove_filler_words(words: List[str]) -> List[str]:
    """Remove common filler words from word list"""
    return [word for word in words if word.lower() not in FILLER_WORDS]


def calculate_word_accuracy(
    expected_text: str,
    spoken_text: str,
    ignore_fillers: bool = True
) -> Tuple[float, Dict[str, any]]:
    """
    Calculate word-level accuracy between expected and spoken text

    Args:
        expected_text: The correct text (reference)
        spoken_text: What the user actually said (hypothesis)
        ignore_fillers: Whether to ignore filler words

    Returns:
        Tuple of (accuracy_percentage, details_dict)

    Details dict contains:
        - expected_words: List of expected words
        - spoken_words: List of spoken words
        - matches: Number of matching words
        - substitutions: Number of word substitutions
        - insertions: Number of extra words
        - deletions: Number of missing words
        - wer: Word Error Rate (0-1, lower is better)
        - similarity_ratio: Overall similarity (0-1, higher is better)
    """
    try:
        # Normalize texts
        expected_normalized = normalize_text(expected_text)
        spoken_normalized = normalize_text(spoken_text)

        # Split into words
        expected_words = expected_normalized.split()
        spoken_words = spoken_normalized.split()

        # Remove filler words if requested
        if ignore_fillers:
            expected_words = remove_filler_words(expected_words)
            spoken_words = remove_filler_words(spoken_words)

        # Handle empty cases
        if not expected_words:
            logger.warning("Expected text is empty after normalization")
            return 0.0, {"error": "Expected text is empty"}

        if not spoken_words:
            logger.warning("Spoken text is empty after normalization")
            return 0.0, {
                "expected_words": expected_words,
                "spoken_words": [],
                "matches": 0,
                "substitutions": 0,
                "insertions": 0,
                "deletions": len(expected_words),
                "wer": 1.0,
                "similarity_ratio": 0.0
            }

        # Use SequenceMatcher for detailed comparison
        matcher = SequenceMatcher(None, expected_words, spoken_words)

        # Calculate operations
        matches = 0
        substitutions = 0
        insertions = 0
        deletions = 0

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                matches += (i2 - i1)
            elif tag == 'replace':
                substitutions += max(i2 - i1, j2 - j1)
            elif tag == 'insert':
                insertions += (j2 - j1)
            elif tag == 'delete':
                deletions += (i2 - i1)

        # Calculate Word Error Rate (WER)
        # WER = (S + D + I) / N
        # where S=substitutions, D=deletions, I=insertions, N=number of words in reference
        num_expected_words = len(expected_words)
        wer = (substitutions + deletions + insertions) / num_expected_words if num_expected_words > 0 else 1.0

        # Calculate overall similarity ratio
        similarity_ratio = matcher.ratio()

        # Calculate accuracy percentage
        # Accuracy = 1 - WER (capped at 0-100%)
        accuracy = max(0.0, min(100.0, (1.0 - wer) * 100))

        details = {
            "expected_words": expected_words,
            "spoken_words": spoken_words,
            "matches": matches,
            "substitutions": substitutions,
            "insertions": insertions,
            "deletions": deletions,
            "wer": round(wer, 3),
            "similarity_ratio": round(similarity_ratio, 3),
            "num_expected_words": num_expected_words,
            "num_spoken_words": len(spoken_words)
        }

        logger.info(f"Accuracy calculated: {accuracy:.1f}% (WER: {wer:.3f})")

        return round(accuracy, 1), details

    except Exception as e:
        logger.error(f"Error calculating word accuracy: {e}")
        raise


def get_pronunciation_feedback(
    expected_text: str,
    spoken_text: str,
    accuracy: float,
    details: Dict[str, any]
) -> str:
    """
    Generate human-readable feedback about pronunciation accuracy

    Args:
        expected_text: The correct text
        spoken_text: What the user said
        accuracy: Accuracy percentage
        details: Details from calculate_word_accuracy

    Returns:
        str: Feedback message
    """
    try:
        # Extract details
        matches = details.get("matches", 0)
        substitutions = details.get("substitutions", 0)
        deletions = details.get("deletions", 0)
        insertions = details.get("insertions", 0)

        feedback_parts = []

        # Overall assessment
        if accuracy >= 95:
            feedback_parts.append("🎉 Excellent! Your pronunciation is nearly perfect!")
        elif accuracy >= 85:
            feedback_parts.append("👍 Great job! Your pronunciation is very good.")
        elif accuracy >= 70:
            feedback_parts.append("✅ Good effort! You're on the right track.")
        elif accuracy >= 50:
            feedback_parts.append("💪 Keep practicing! You're making progress.")
        else:
            feedback_parts.append("🔄 Let's try again. Don't worry, practice makes perfect!")

        # Specific issues
        issues = []
        if deletions > 0:
            issues.append(f"{deletions} word(s) missing")
        if substitutions > 0:
            issues.append(f"{substitutions} word(s) incorrect")
        if insertions > 0:
            issues.append(f"{insertions} extra word(s)")

        if issues:
            feedback_parts.append(f"Issues: {', '.join(issues)}.")

        # Matched words
        if matches > 0:
            feedback_parts.append(f"You got {matches} word(s) correct!")

        return " ".join(feedback_parts)

    except Exception as e:
        logger.error(f"Error generating pronunciation feedback: {e}")
        return "Unable to generate detailed feedback at this time."


def calculate_hybrid_score(
    word_accuracy: float,
    ai_score: float,
    word_weight: float = 0.5,
    ai_weight: float = 0.5
) -> float:
    """
    Calculate hybrid score combining word accuracy and AI evaluation

    Args:
        word_accuracy: Word-level accuracy (0-100)
        ai_score: AI evaluation score (0-100)
        word_weight: Weight for word accuracy (default 0.5)
        ai_weight: Weight for AI score (default 0.5)

    Returns:
        float: Combined score (0-100)
    """
    if word_weight + ai_weight != 1.0:
        logger.warning(f"Weights don't sum to 1.0: {word_weight} + {ai_weight}")
        # Normalize weights
        total = word_weight + ai_weight
        word_weight /= total
        ai_weight /= total

    hybrid_score = (word_accuracy * word_weight) + (ai_score * ai_weight)
    return round(hybrid_score, 1)
