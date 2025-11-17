import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { evaluateReadAloud } from '../../api/teacherApi';
import { useStudio } from '../../contexts/StudioContext';
import { useUserProgress } from '../../contexts/UserProgressContext';
import AudioFeedback from './AudioFeedback';
import './SpeakingLab.css';

// Practice sentences with icons and topics
const PRACTICE_SENTENCES = [
  {
    id: 1,
    label: "Morning",
    icon: "sun",
    text: "Good morning! I usually wake up at seven and have a healthy breakfast.",
    topics: ["morning_routine", "daily_life", "greetings"]
  },
  {
    id: 2,
    label: "Healthy",
    icon: "healthy",
    text: "I'd like the grilled salmon with steamed vegetables, please.",
    topics: ["ordering_food", "healthy_eating", "restaurant", "food"]
  },
  {
    id: 3,
    label: "Polite",
    icon: "polite",
    text: "Could I have the dressing on the side? Thank you so much.",
    topics: ["polite_requests", "ordering_food", "restaurant", "coffee_shop"]
  },
  {
    id: 4,
    label: "Chat",
    icon: "chat",
    text: "How was your weekend? Did you do anything interesting?",
    topics: ["small_talk", "conversation", "social"]
  },
  {
    id: 5,
    label: "Work",
    icon: "work",
    text: "I'll send you the report by the end of the day.",
    topics: ["work", "business", "professional"]
  }
];

// Topic mapping configuration
const TOPIC_CONFIG = {
  "ordering_food": {
    title: "Ordering Food",
    description: "Practice polite food ordering from your lesson"
  },
  "coffee_shop": {
    title: "Coffee Shop",
    description: "Practice ordering at a coffee shop"
  },
  "polite_requests": {
    title: "Polite Requests",
    description: "Practice making polite requests"
  },
  "restaurant": {
    title: "Restaurant",
    description: "Practice restaurant conversations"
  }
};

const SpeakingLab = ({ onAvatarStateChange, topic }) => {
  const { clearSpeakingTopic } = useStudio();
  const { addWeakWord, settings } = useUserProgress();

  // Find sentence matching the topic or default to first
  const getInitialSentence = () => {
    if (topic) {
      const matchingSentence = PRACTICE_SENTENCES.find(s =>
        s.topics.includes(topic)
      );
      return matchingSentence || PRACTICE_SENTENCES[1]; // Default to "Healthy" if no match
    }
    return PRACTICE_SENTENCES[0];
  };

  const [selectedSentence, setSelectedSentence] = useState(getInitialSentence());
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const recorder = useAudioRecorder();

  // Update selected sentence when topic changes
  useEffect(() => {
    if (topic) {
      const matchingSentence = PRACTICE_SENTENCES.find(s =>
        s.topics.includes(topic)
      );
      if (matchingSentence) {
        setSelectedSentence(matchingSentence);
      }
    }
  }, [topic]);

  const handleSelectSentence = (sentence) => {
    if (!recorder.isRecording) {
      setSelectedSentence(sentence);
      setResult(null);
      setError(null);
      recorder.reset();
      setShowDetails(false);
    }
  };

  const handleStartRecording = async () => {
    setResult(null);
    setError(null);

    if (onAvatarStateChange) {
      onAvatarStateChange.startListening();
    }

    try {
      await recorder.startRecording();
    } catch (err) {
      setError(recorder.error || 'Failed to access microphone');
      if (onAvatarStateChange) {
        onAvatarStateChange.resetToIdle();
      }
    }
  };

  const handleStopRecording = () => {
    recorder.stopRecording();
    if (onAvatarStateChange) {
      onAvatarStateChange.resetToIdle();
    }
  };

  const handleCheckPronunciation = async () => {
    if (!recorder.hasRecording) return;

    setIsEvaluating(true);
    setError(null);

    if (onAvatarStateChange) {
      onAvatarStateChange.startThinking();
    }

    try {
      const audioFile = recorder.getAudioFile('recording.webm');
      const evaluation = await evaluateReadAloud(audioFile, selectedSentence.text, 'en');

      setResult(evaluation);

      // Save tricky words to weak words list if score is below threshold
      const threshold = settings?.pronunciationThreshold || 85;
      if (evaluation.overall_score < threshold && evaluation.tricky_words && evaluation.tricky_words.length > 0) {
        evaluation.tricky_words.forEach(word => {
          // Determine error type based on accuracy details
          let errorType = 'mispronunciation';
          if (evaluation.accuracy_details) {
            if (evaluation.accuracy_details.substitutions > 0) {
              errorType = 'substitution';
            } else if (evaluation.accuracy_details.deletions > 0) {
              errorType = 'deletion';
            }
          }
          addWeakWord(word, errorType, 1);
        });
      }

      if (onAvatarStateChange) {
        onAvatarStateChange.startSpeaking();
      }

      setTimeout(() => {
        if (evaluation.overall_score >= 85) {
          if (onAvatarStateChange) onAvatarStateChange.celebrate();
        } else {
          if (onAvatarStateChange) onAvatarStateChange.resetToIdle();
        }
      }, 2500);

    } catch (err) {
      console.error('Error evaluating:', err);
      setError(err.message || 'Failed to evaluate pronunciation');
      if (onAvatarStateChange) {
        onAvatarStateChange.resetToIdle();
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    recorder.reset();
    setResult(null);
    setError(null);
    setShowDetails(false);
    if (onAvatarStateChange) {
      onAvatarStateChange.resetToIdle();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--color-accent-primary)';
    if (score >= 75) return 'var(--color-accent-secondary)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 75) return 'Great job!';
    if (score >= 60) return 'Good effort!';
    return 'Keep practicing!';
  };

  // Get topic info if available
  const topicInfo = topic ? TOPIC_CONFIG[topic] : null;

  return (
    <div className="speaking-lab-new">
      {/* Header */}
      <div className="lab-header-new">
        <div className="lab-header-title">
          <Icon name="book" size="xl" />
          <h2>
            {topicInfo ? topicInfo.title : "Pronunciation Studio"}
          </h2>
        </div>
        <p className="lab-header-subtitle">
          {topicInfo ? topicInfo.description : "Practice your reading with Coach Ivy"}
        </p>
        {topic && (
          <div className="topic-badge">
            <Icon name="lessons" size="sm" />
            <span>From your lesson</span>
          </div>
        )}
      </div>

      {/* Sentence Tabs */}
      <div className="sentence-tabs">
        {PRACTICE_SENTENCES.map((sentence) => {
          return (
            <button
              key={sentence.id}
              className={`sentence-tab ${selectedSentence.id === sentence.id ? 'active' : ''}`}
              onClick={() => handleSelectSentence(sentence)}
              disabled={recorder.isRecording}
            >
              <Icon name={sentence.icon} size="base" />
              <span>{sentence.label}</span>
            </button>
          );
        })}
      </div>

      {/* Practice Card */}
      <div className="practice-card glass">
        {/* Target Sentence */}
        <div className="practice-sentence">
          <div className="practice-sentence-header">
            <Icon name="quote" size="base" />
            <span>Read this sentence</span>
          </div>
          <div className="practice-sentence-text">{selectedSentence.text}</div>
        </div>

        {/* Recorder */}
        <div className="practice-recorder">
          {/* IDLE */}
          {!recorder.isRecording && !recorder.hasRecording && (
            <div className="recorder-idle">
              <div className="recorder-visual">
                <div className="recorder-icon-circle">
                  <Icon name="mic" size={32} />
                </div>
              </div>
              <button className="btn-record" onClick={handleStartRecording}>
                <Icon name="mic" size="lg" />
                <span>Record</span>
              </button>
              <p className="recorder-hint">Tap to start, read at your normal speed</p>
            </div>
          )}

          {/* RECORDING */}
          {recorder.isRecording && (
            <div className="recorder-active">
              <div className="recorder-visual">
                <div className="recorder-icon-circle recording">
                  <Icon name="mic" size={32} />
                  <div className="recorder-pulse" />
                </div>
                <div className="recorder-timer">{recorder.duration.toFixed(1)}s</div>
              </div>
              <button className="btn-stop" onClick={handleStopRecording}>
                <Icon name="stop" size="lg" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* RECORDED */}
          {recorder.hasRecording && !result && (
            <div className="recorder-ready">
              <div className="recorder-visual">
                <div className="recorder-checkmark">✓</div>
              </div>
              <p className="recorder-ready-text">Recording ready!</p>
              <div className="recorder-actions">
                <button
                  className="btn-check"
                  onClick={handleCheckPronunciation}
                  disabled={isEvaluating}
                >
                  {isEvaluating ? 'Evaluating...' : 'Check My Pronunciation'}
                </button>
                <button className="btn-retry-small" onClick={handleTryAgain}>
                  <Icon name="retry" size="sm" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="practice-error">
            <Icon name="alert" size="base" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="result-card-new glass">
          {/* Score Section */}
          <div className="result-score-section">
            <div className="result-score-visual">
              <div
                className="score-ring-new"
                style={{
                  borderColor: getScoreColor(result.overall_score),
                  boxShadow: `0 0 20px ${getScoreColor(result.overall_score)}40`
                }}
              >
                {result.overall_score >= 90 && <Icon name="sparkles" size="xl" className="score-sparkle" />}
                <div className="score-number-new" style={{ color: getScoreColor(result.overall_score) }}>
                  {Math.round(result.overall_score)}
                </div>
                <div className="score-max-new">/100</div>
              </div>
              <div className="result-score-text">
                <div className="result-score-message">{getScoreMessage(result.overall_score)}</div>
                <div className="result-score-accuracy">Word accuracy: {result.word_accuracy.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Audio Feedback - Always visible */}
          <AudioFeedback
            feedbackEn={result.feedback_en}
            feedbackVi={result.feedback_vi}
            ttsEnUrl={result.tts_en_url}
            ttsViUrl={result.tts_vi_url}
            onAvatarStateChange={onAvatarStateChange}
          />

          {/* Progressive Disclosure Toggle */}
          <div className="progressive-disclosure-toggle">
            <button
              className={`disclosure-btn ${showDetails ? 'active' : ''}`}
              onClick={() => setShowDetails(!showDetails)}
            >
              <Icon name={showDetails ? "eyeOff" : "eye"} size="base" />
              <span>{showDetails ? 'Hide Details' : 'Show Detailed Analysis'}</span>
              <Icon name={showDetails ? "chevronUp" : "chevronDown"} size="sm" />
            </button>
          </div>

          {/* Detailed Analysis - Hidden by default */}
          {showDetails && (
            <div className="detailed-analysis">
              {/* Transcript Comparison */}
              <div className="result-transcripts">
                <div className="transcript-box">
                  <div className="transcript-label">
                    <Icon name="quote" size="xs" />
                    <span>Expected</span>
                  </div>
                  <div className="transcript-text">{result.expected_text}</div>
                </div>
                <div className="transcript-box spoken">
                  <div className="transcript-label">
                    <Icon name="mic" size="xs" />
                    <span>You said</span>
                  </div>
                  <div className="transcript-text">{result.transcript}</div>
                </div>
              </div>

              {/* Tricky Words */}
              {result.tricky_words && result.tricky_words.length > 0 && (
                <div className="tricky-words-section">
                  <div className="tricky-words-header">
                    <Icon name="highlighter" size="sm" />
                    <span>Tricky words to practice</span>
                  </div>
                  <div className="tricky-words-list">
                    {result.tricky_words.map((word, index) => (
                      <span key={index} className="tricky-word-chip">{word}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Metrics */}
              {result.accuracy_details && (
                <div className="technical-metrics-section">
                  <div className="technical-metrics-header">
                    <Icon name="barChart" size="sm" />
                    <span>Technical Metrics</span>
                  </div>
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-label">Correct Words</div>
                      <div className="detail-value green">{result.accuracy_details.matches}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Wrong Words</div>
                      <div className="detail-value red">{result.accuracy_details.substitutions}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Missing Words</div>
                      <div className="detail-value orange">{result.accuracy_details.deletions}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Extra Words</div>
                      <div className="detail-value orange">{result.accuracy_details.insertions}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">WER</div>
                      <div className="detail-value">{result.accuracy_details.wer.toFixed(3)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="result-actions-new">
            <button className="btn-practice-again-new" onClick={handleTryAgain}>
              <Icon name="retry" size="base" />
              <span>Practice Again</span>
            </button>
            <button
              className="btn-next-new"
              onClick={() => {
                const currentIndex = PRACTICE_SENTENCES.findIndex(s => s.id === selectedSentence.id);
                const nextSentence = PRACTICE_SENTENCES[(currentIndex + 1) % PRACTICE_SENTENCES.length];
                handleSelectSentence(nextSentence);
              }}
            >
              <span>Next Sentence</span>
              <Icon name="arrowRight" size="base" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingLab;
