/**
 * TTS Helper Module
 * Centralized Text-to-Speech functionality for the English Learning App
 */

const TTS_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Voice mapping for coaches and languages
 * Maps coach_id + lang to OpenAI TTS voice
 */
const VOICE_MAP = {
  ivy: {
    en: 'alloy',      // Warm, friendly female voice
    vi: 'nova'        // Clear, pleasant female voice for Vietnamese
  },
  leo: {
    en: 'onyx',       // Casual male voice
    vi: 'echo'        // Clear male voice for Vietnamese
  }
};

/**
 * Get voice for coach and language
 * @param {string} coachId - Coach ID ('ivy' or 'leo')
 * @param {string} lang - Language ('en' or 'vi')
 * @returns {string} - OpenAI voice name
 */
const getVoice = (coachId, lang) => {
  return VOICE_MAP[coachId]?.[lang] || 'alloy';
};

/**
 * Speak text using OpenAI TTS via backend API
 * @param {string} text - The text to speak
 * @param {string} lang - Language code ('en' or 'vi')
 * @param {string} coachId - Coach ID for voice selection ('ivy' or 'leo')
 * @returns {Promise<HTMLAudioElement|null>} - Audio element or null if error
 */
export const speakText = async (text, lang = 'en', coachId = 'ivy') => {
  try {
    const voice = getVoice(coachId, lang);

    const response = await fetch(`${TTS_BASE_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.audio_url) {
      throw new Error('No audio URL returned from TTS API');
    }

    // Construct full audio URL
    const audioUrl = data.audio_url.startsWith('http')
      ? data.audio_url
      : `${TTS_BASE_URL}${data.audio_url}`;

    // Create and play audio
    const audio = new Audio(audioUrl);
    await audio.play();

    return audio;
  } catch (error) {
    console.error('TTS error:', error);
    return null;
  }
};

/**
 * Speak English text
 * @param {string} text - English text to speak
 * @param {string} coachId - Coach ID
 * @returns {Promise<HTMLAudioElement|null>}
 */
export const speakEnglish = async (text, coachId = 'ivy') => {
  return speakText(text, 'en', coachId);
};

/**
 * Speak Vietnamese text
 * @param {string} text - Vietnamese text to speak
 * @param {string} coachId - Coach ID
 * @returns {Promise<HTMLAudioElement|null>}
 */
export const speakVietnamese = async (text, coachId = 'ivy') => {
  return speakText(text, 'vi', coachId);
};

/**
 * Stop currently playing audio
 * @param {HTMLAudioElement} audio - Audio element to stop
 */
export const stopAudio = (audio) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

/**
 * Preload audio for faster playback
 * @param {string} text - Text to preload
 * @param {string} lang - Language code
 * @param {string} coachId - Coach ID
 * @returns {Promise<string|null>} - Audio URL or null
 */
export const preloadAudio = async (text, lang = 'en', coachId = 'ivy') => {
  try {
    const voice = getVoice(coachId, lang);

    const response = await fetch(`${TTS_BASE_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const data = await response.json();

    // Construct full audio URL
    const audioUrl = data.audio_url?.startsWith('http')
      ? data.audio_url
      : `${TTS_BASE_URL}${data.audio_url}`;

    return audioUrl || null;
  } catch (error) {
    console.error('Preload TTS error:', error);
    return null;
  }
};
