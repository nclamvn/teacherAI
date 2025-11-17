/**
 * useAudioRecorder Hook
 * Handles browser audio recording using MediaRecorder API
 */
import { useState, useRef, useCallback } from 'react';

export const RECORDER_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  STOPPED: 'stopped',
  ERROR: 'error'
};

export function useAudioRecorder() {
  const [state, setState] = useState(RECORDER_STATES.IDLE);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      // Try webm/opus first (best quality), fallback to browser default
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Use browser default
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm'
        });
        setAudioBlob(blob);
        setState(RECORDER_STATES.STOPPED);

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording failed: ' + event.error?.message);
        setState(RECORDER_STATES.ERROR);
        stopRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Start duration timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 0.1);
      }, 100);

      setState(RECORDER_STATES.RECORDING);
      setError(null);

    } catch (err) {
      console.error('Failed to start recording:', err);

      let errorMessage = 'Failed to access microphone';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone.';
      }

      setError(errorMessage);
      setState(RECORDER_STATES.ERROR);
    }
  }, []);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  /**
   * Cancel recording and reset
   */
  const cancelRecording = useCallback(() => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Reset state
    chunksRef.current = [];
    setAudioBlob(null);
    setDuration(0);
    setState(RECORDER_STATES.IDLE);
    setError(null);
  }, []);

  /**
   * Reset to idle state (clears audio blob)
   */
  const reset = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  /**
   * Create audio URL from blob (for playback preview)
   */
  const getAudioURL = useCallback(() => {
    if (audioBlob) {
      return URL.createObjectURL(audioBlob);
    }
    return null;
  }, [audioBlob]);

  /**
   * Get audio file for upload
   * @param {string} filename - Name for the file
   * @returns {File} Audio file ready for upload
   */
  const getAudioFile = useCallback((filename = 'recording.webm') => {
    if (!audioBlob) {
      return null;
    }

    // Determine file extension from blob type
    const extension = audioBlob.type.includes('webm') ? 'webm' :
                     audioBlob.type.includes('mp3') ? 'mp3' :
                     audioBlob.type.includes('wav') ? 'wav' : 'webm';

    const finalFilename = filename.endsWith(`.${extension}`)
      ? filename
      : `${filename.split('.')[0]}.${extension}`;

    return new File([audioBlob], finalFilename, { type: audioBlob.type });
  }, [audioBlob]);

  return {
    state,
    duration: Math.round(duration * 10) / 10, // Round to 1 decimal place
    audioBlob,
    error,
    isRecording: state === RECORDER_STATES.RECORDING,
    hasRecording: state === RECORDER_STATES.STOPPED && audioBlob !== null,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
    getAudioURL,
    getAudioFile
  };
}
