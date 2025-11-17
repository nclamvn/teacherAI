import { useState } from 'react';
import Icon from '../../ui/Icon';
import { useLesson } from '../../../contexts/LessonContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { speakText } from '../../../utils/ttsHelper';
import './StepStyles.css';

const BuildSentenceStep = ({ step, index, avatarControl }) => {
  const { recordStepResult } = useLesson();
  const { profile } = useProfile();
  // Initialize with shuffled order (or step.words order)
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(
    step.words.map((word, i) => ({ word, originalIndex: i }))
  );
  const [submitted, setSubmitted] = useState(false);

  const handleWordClick = (wordObj) => {
    if (submitted) return;

    // Add word to selected
    setSelectedWords([...selectedWords, wordObj]);
    // Remove from available
    setAvailableWords(availableWords.filter(w => w !== wordObj));
  };

  const handleRemoveWord = (wordObj) => {
    if (submitted) return;

    // Remove from selected
    setSelectedWords(selectedWords.filter(w => w !== wordObj));
    // Add back to available
    setAvailableWords([...availableWords, wordObj]);
  };

  const handleSubmit = async () => {
    const userOrder = selectedWords.map(w => w.originalIndex);
    const correct = JSON.stringify(userOrder) === JSON.stringify(step.correct_order);
    const score = correct ? 100 : 0;
    recordStepResult(index, { correct, score, order: userOrder });
    setSubmitted(true);

    // Avatar reactions and TTS feedback
    if (correct) {
      // Celebrate perfect word order!
      avatarControl?.celebrate();

      // Speak encouragement in English
      await speakText(
        "Perfect! The word order is exactly right. Well done!",
        'en',
        profile?.coach_id || 'ivy'
      );

      // Reset avatar after celebration
      setTimeout(() => {
        avatarControl?.resetToIdle();
      }, 3000);
    } else {
      // Gentle encouragement
      avatarControl?.startSpeaking();

      // Speak gentle correction in Vietnamese
      await speakText(
        "Hãy kiểm tra lại thứ tự các từ. Nghĩ về trật tự tự nhiên của câu tiếng Anh nhé.",
        'vi',
        profile?.coach_id || 'ivy'
      );

      // Reset avatar
      setTimeout(() => {
        avatarControl?.resetToIdle();
      }, 2000);
    }
  };

  const arrangedSentence = selectedWords.map(w => w.word).join(' ');
  const canSubmit = selectedWords.length === step.words.length && !submitted;

  const userOrder = selectedWords.map(w => w.originalIndex);
  const isCorrect = submitted && JSON.stringify(userOrder) === JSON.stringify(step.correct_order);

  return (
    <div className="lesson-card glass">
      <div className="step-tag build-sentence">
        <Icon name="penTool" size="base" />
        Build the sentence
      </div>

      <p className="prompt">{step.prompt}</p>

      {/* Preview area */}
      <div className="sentence-preview">
        {selectedWords.length === 0 ? (
          <span className="preview-placeholder">Tap words to build your sentence...</span>
        ) : (
          <div className="selected-words">
            {selectedWords.map((wordObj, i) => (
              <button
                key={i}
                className="word-chip selected"
                onClick={() => handleRemoveWord(wordObj)}
                disabled={submitted}
              >
                {wordObj.word}
                {!submitted && <Icon name="x" size="sm" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Word bank */}
      <div className="word-bank">
        <p className="word-bank-label">Available words:</p>
        <div className="word-chips">
          {availableWords.map((wordObj, i) => (
            <button
              key={i}
              className="word-chip available"
              onClick={() => handleWordClick(wordObj)}
              disabled={submitted}
            >
              {wordObj.word}
            </button>
          ))}
        </div>
      </div>

      <div className="build-sentence-footer">
        {!submitted ? (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Icon name="checkCircle" size="base" />
            Check sentence
          </button>
        ) : (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              <Icon name={isCorrect ? 'sparkles' : 'brain'} size="xl" />
            </div>
            <div className="feedback-content">
              <p className="feedback-title">
                {isCorrect ? 'Perfect order! ✨' : 'Good try! 💪'}
              </p>
              {!isCorrect && (
                <p className="feedback-explanation">
                  Check the word order again. Think about the natural flow of English.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildSentenceStep;
