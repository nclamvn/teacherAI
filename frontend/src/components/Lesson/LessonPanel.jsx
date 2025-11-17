import { useState } from 'react';
import Icon from '../ui/Icon';
import { checkExercise, generateTTS, playAudioWithAvatar } from '../../api/teacherApi';
import './LessonPanel.css';

const MOCK_LESSON = {
  title: "Ordering Healthy Food",
  subtitle: "Restaurant Conversations",
  dialogue: [
    {
      speaker: "Waiter",
      text: "Good evening! Are you ready to order?"
    },
    {
      speaker: "Customer",
      text: "Yes, I'd like the grilled salmon with steamed vegetables, please."
    },
    {
      speaker: "Waiter",
      text: "Excellent choice! Would you like any dressing on the side?"
    },
    {
      speaker: "Customer",
      text: "Just a light vinaigrette, thank you."
    }
  ],
  keyPhrases: [
    {
      english: "I'd like...",
      vietnamese: "Tôi muốn...",
      example: "I'd like the grilled salmon, please."
    },
    {
      english: "on the side",
      vietnamese: "riêng / để riêng",
      example: "Could I have the dressing on the side?"
    },
    {
      english: "Excellent choice",
      vietnamese: "Lựa chọn tuyệt vời",
      example: "That's an excellent choice for a healthy meal."
    }
  ],
  exercise: {
    question: "Complete the sentence: 'I'd _____ the grilled fish, please.'",
    options: ["want", "like", "need", "have"],
    correctAnswer: 1
  }
};

const LessonPanel = ({ onAnswer, onAvatarStateChange }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setShowResult(false);
    setFeedback('');
  };

  const handlePlayPhrase = async (text) => {
    if (playingAudio) {
      return; // Prevent multiple audio playing at once
    }

    try {
      setPlayingAudio(text);

      // Generate TTS
      const { audio_url } = await generateTTS(text);

      // Play audio with avatar
      playAudioWithAvatar(
        audio_url,
        () => {
          // On start
          if (onAvatarStateChange) {
            onAvatarStateChange.startSpeaking();
          }
        },
        () => {
          // On end
          if (onAvatarStateChange) {
            onAvatarStateChange.resetToIdle();
          }
          setPlayingAudio(null);
        }
      );
    } catch (error) {
      console.error('Error playing phrase:', error);
      setPlayingAudio(null);
      if (onAvatarStateChange) {
        onAvatarStateChange.resetToIdle();
      }
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedAnswer === null) return;

    setIsLoading(true);

    // Avatar: Start thinking
    if (onAvatarStateChange) {
      onAvatarStateChange.startThinking();
    }

    try {
      // Call backend API to check answer
      const response = await checkExercise({
        lesson_id: "lesson-001-healthy-food",
        exercise_type: "multiple_choice",
        user_answers: [MOCK_LESSON.exercise.options[selectedAnswer]],
        correct_answers: [MOCK_LESSON.exercise.options[MOCK_LESSON.exercise.correctAnswer]],
        question: MOCK_LESSON.exercise.question
      });

      // Update UI with response
      setIsCorrect(response.is_correct);
      setFeedback(response.feedback);
      setShowResult(true);

      // Avatar: Start speaking
      if (onAvatarStateChange) {
        onAvatarStateChange.startSpeaking();
      }

      // After 2 seconds, celebrate or reset
      setTimeout(() => {
        if (response.is_correct) {
          if (onAvatarStateChange) {
            onAvatarStateChange.celebrate();
          }
        } else {
          if (onAvatarStateChange) {
            onAvatarStateChange.resetToIdle();
          }
        }
      }, 2000);

      // Notify parent
      if (onAnswer) {
        onAnswer(response.is_correct);
      }

    } catch (error) {
      console.error('Error checking answer:', error);
      setFeedback('Oops! Something went wrong. Please try again.');
      setShowResult(true);

      // Reset avatar on error
      if (onAvatarStateChange) {
        onAvatarStateChange.resetToIdle();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lesson-panel glass">
      {/* Lesson Header */}
      <div className="lesson-header">
        <div className="lesson-badge">Today's Lesson</div>
        <h2 className="lesson-title">{MOCK_LESSON.title}</h2>
        <p className="lesson-subtitle">{MOCK_LESSON.subtitle}</p>
      </div>

      {/* Dialogue Section */}
      <div className="lesson-section">
        <h3 className="section-title">
          <span className="section-icon">
            <Icon name="chat" size="lg" />
          </span>
          Dialogue
        </h3>
        <div className="dialogue-container">
          {MOCK_LESSON.dialogue.map((line, index) => (
            <div key={index} className="dialogue-line">
              <div className="speaker-name">{line.speaker}:</div>
              <div className="speaker-text">{line.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Phrases Section */}
      <div className="lesson-section">
        <h3 className="section-title">
          <span className="section-icon">
            <Icon name="highlighter" size="lg" />
          </span>
          Key Phrases
        </h3>
        <div className="phrases-container">
          {MOCK_LESSON.keyPhrases.map((phrase, index) => (
            <div key={index} className="phrase-card glass-hover">
              <div className="phrase-english">{phrase.english}</div>
              <div className="phrase-vietnamese">{phrase.vietnamese}</div>
              <div className="phrase-example">
                <span className="example-label">Example:</span> {phrase.example}
              </div>
              <button
                className="phrase-action"
                onClick={() => handlePlayPhrase(phrase.example)}
                disabled={playingAudio === phrase.example}
              >
                <Icon name="volume" size="base" />
                <span>{playingAudio === phrase.example ? 'Playing...' : 'Hear it'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Section */}
      <div className="lesson-section">
        <h3 className="section-title">
          <span className="section-icon">
            <Icon name="listChecks" size="lg" />
          </span>
          Practice Exercise
        </h3>
        <div className="exercise-container">
          <p className="exercise-question">{MOCK_LESSON.exercise.question}</p>

          <div className="exercise-options">
            {MOCK_LESSON.exercise.options.map((option, index) => (
              <button
                key={index}
                className={`exercise-option ${selectedAnswer === index ? 'selected' : ''} ${
                  showResult
                    ? index === MOCK_LESSON.exercise.correctAnswer
                      ? 'correct'
                      : selectedAnswer === index
                      ? 'incorrect'
                      : ''
                    : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>

          {!showResult && selectedAnswer !== null && (
            <button
              className="check-button"
              onClick={handleCheckAnswer}
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Check Answer'}
            </button>
          )}

          {showResult && feedback && (
            <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
              <span className="result-icon">
                <Icon name={isCorrect ? 'sparkles' : 'brain'} size="xl" />
              </span>
              <div>
                <strong>{isCorrect ? 'Perfect!' : 'Not quite!'}</strong>
                <div style={{ marginTop: '8px' }}>{feedback}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPanel;
