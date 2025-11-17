/**
 * Teacher API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://localhost:8001';

/**
 * Chat with Coach Ivy
 * @param {string} message - User's message
 * @param {string} mode - Conversation mode (free_chat, explain, speaking_feedback)
 * @param {object} context - Additional context
 * @returns {Promise<{reply: string, emotion_tag: string, tts_url: string|null}>}
 */
export async function chatWithTeacher(message, mode = 'free_chat', context = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        mode,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error chatting with teacher:', error);
    throw error;
  }
}

/**
 * Check exercise answers
 * @param {object} payload - Exercise check payload
 * @returns {Promise<{is_correct: boolean, score: number, feedback: string, emotion_tag: string, tts_url: string|null}>}
 */
export async function checkExercise(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lesson/check-exercise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking exercise:', error);
    throw error;
  }
}

/**
 * Generate text-to-speech
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice to use (optional)
 * @returns {Promise<{audio_url: string, text: string}>}
 */
export async function generateTTS(text, voice = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert relative URL to absolute
    if (data.audio_url && !data.audio_url.startsWith('http')) {
      data.audio_url = `${API_BASE_URL}${data.audio_url}`;
    }

    return data;
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw error;
  }
}

/**
 * Play audio and trigger avatar speaking state
 * @param {string} audioUrl - URL to audio file
 * @param {function} onStart - Callback when audio starts
 * @param {function} onEnd - Callback when audio ends
 * @returns {HTMLAudioElement} Audio element
 */
export function playAudioWithAvatar(audioUrl, onStart = null, onEnd = null) {
  const audio = new Audio(audioUrl);

  audio.addEventListener('play', () => {
    if (onStart) onStart();
  });

  audio.addEventListener('ended', () => {
    if (onEnd) onEnd();
  });

  audio.addEventListener('error', (e) => {
    console.error('Audio playback error:', e);
    if (onEnd) onEnd(); // Reset avatar state even on error
  });

  audio.play().catch(err => {
    console.error('Failed to play audio:', err);
    if (onEnd) onEnd();
  });

  return audio;
}

/**
 * Health check
 * @returns {Promise<object>}
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Evaluate read-aloud pronunciation
 * @param {File} audioFile - Recorded audio file
 * @param {string} expectedText - The text the user should have read
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<object>} Evaluation results with transcript, accuracy, feedback, etc.
 */
export async function evaluateReadAloud(audioFile, expectedText, language = 'en') {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('expected_text', expectedText);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/api/speaking/read-aloud`, {
      method: 'POST',
      body: formData
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error evaluating read-aloud:', error);
    throw error;
  }
}

/**
 * Free-form speaking evaluation (future feature)
 * @param {File} audioFile - Recorded audio file
 * @param {string} context - Conversation context
 * @param {string} language - Language code (default: 'en')
 * @returns {Promise<object>} Response with transcript and conversational reply
 */
export async function evaluateFreeSpeaking(audioFile, context = null, language = 'en') {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (context) {
      formData.append('context', context);
    }
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/api/speaking/free-speak`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error evaluating free speaking:', error);
    throw error;
  }
}
