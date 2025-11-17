import { useState, useRef } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useUserProgress } from '../../contexts/UserProgressContext';
import { useStudio } from '../../contexts/StudioContext';
import Icon from '../ui/Icon';
import './WeakWordsPanel.css';

const MiniDrillModal = ({ word, onClose }) => {
  const { profile } = useProfile();
  const { addWeakWord, markAsMastered, settings } = useUserProgress();
  const { switchToLiveTalk } = useStudio();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showMasteredToast, setShowMasteredToast] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSubmitAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
      alert('Could not access microphone.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmitAudio = async (audioBlob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'drill.webm');
      formData.append('expected_text', word.word);
      formData.append('user_id', profile?.user_id || 'user_001');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/speaking/practice`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      setResult(data);
      setAttemptCount(prev => prev + 1);

      // Get mastery thresholds from settings
      const masteryThreshold = settings?.masteredWordThreshold || 90;
      const requiredAttempts = settings?.masteredWordAttempts || 3;

      // Calculate new success streak
      let newSuccessStreak = 0;
      if (data.accuracy_score >= masteryThreshold) {
        // Increment success streak
        newSuccessStreak = (word.success_streak || 0) + 1;
      } else {
        // Reset success streak
        newSuccessStreak = 0;
      }

      // Update word with new score and success_streak
      addWeakWord(word.word, word.error_type, 0, {
        last_score: data.accuracy_score,
        success_streak: newSuccessStreak
      });

      // Check if word should be marked as mastered
      if (newSuccessStreak >= requiredAttempts) {
        const updatedWord = {
          ...word,
          success_streak: newSuccessStreak,
          last_score: data.accuracy_score
        };
        markAsMastered(updatedWord);
        setShowMasteredToast(true);

        // Auto-hide toast and close modal after celebration
        setTimeout(() => {
          setShowMasteredToast(false);
          setTimeout(onClose, 1500);
        }, 3000);
      }

    } catch (error) {
      console.error('Failed to process audio:', error);
      alert('Failed to process your pronunciation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleTryAgain = () => {
    setResult(null);
  };

  const handlePracticeInLiveTalk = () => {
    switchToLiveTalk(word.word);
    onClose();
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 60) return 'score-ok';
    return 'score-poor';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 75) return 'Good job!';
    if (score >= 60) return 'Keep practicing';
    return 'Try again';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mini-drill-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mini-drill-header">
          <div className="mini-drill-title">
            <Icon name="target" size="lg" />
            <h3>Practice: {word.word}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <Icon name="x" size="base" />
          </button>
        </div>

        {/* Word Display */}
        <div className="drill-word-display">
          <div className="target-word">{word.word}</div>
          <div className="word-meta">
            <span className={`error-badge ${word.error_type === 'substitution' ? 'badge-orange' : word.error_type === 'deletion' ? 'badge-red' : 'badge-purple'}`}>
              {word.error_type}
            </span>
            <span className="attempt-count">
              Attempt {attemptCount + 1}
            </span>
          </div>
        </div>

        {/* Instructions */}
        {!result && (
          <div className="drill-instructions">
            <Icon name="info" size="sm" />
            <p>Click the microphone and say the word clearly</p>
          </div>
        )}

        {/* Recording Button */}
        {!result && (
          <div className="drill-mic-container">
            <button
              className={`drill-mic-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
              onClick={handleToggleRecording}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon name="brain" size="2xl" />
                  <span className="mic-label">Processing...</span>
                </>
              ) : isRecording ? (
                <>
                  <Icon name="stop" size="2xl" />
                  <span className="mic-label">Stop Recording</span>
                </>
              ) : (
                <>
                  <Icon name="mic" size="2xl" />
                  <span className="mic-label">Start Recording</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="drill-result">
            <div className={`drill-score ${getScoreColor(result.accuracy_score)}`}>
              <div className="score-circle">
                <span className="score-value">{result.accuracy_score}</span>
                <span className="score-max">/100</span>
              </div>
              <div className="score-message">{getScoreMessage(result.accuracy_score)}</div>
            </div>

            <div className="drill-transcripts">
              <div className="transcript-row">
                <span className="transcript-label">Expected:</span>
                <span className="transcript-text expected">{result.expected_text}</span>
              </div>
              <div className="transcript-row">
                <span className="transcript-label">You said:</span>
                <span className="transcript-text actual">{result.transcript}</span>
              </div>
            </div>

            {result.feedback_en && (
              <div className="drill-feedback">
                <Icon name="lightbulb" size="sm" />
                <p>{result.feedback_en}</p>
              </div>
            )}

            <div className="drill-actions">
              <button className="btn-try-again" onClick={handleTryAgain}>
                <Icon name="retry" size="base" />
                <span>Try Again</span>
              </button>
              {result.accuracy_score >= 90 && (
                <button className="btn-live-talk" onClick={handlePracticeInLiveTalk}>
                  <Icon name="messageCircle" size="base" />
                  <span>Use in Conversation</span>
                </button>
              )}
              <button className="btn-done" onClick={onClose}>
                <Icon name="check" size="base" />
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* Mastered Toast */}
        {showMasteredToast && (
          <div className="mastered-toast">
            <div className="mastered-toast-icon">🎉</div>
            <div className="mastered-toast-content">
              <div className="mastered-toast-title">You've mastered it!</div>
              <div className="mastered-toast-word">"{word.word}"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniDrillModal;
