import { useState } from 'react';
import Icon from '../../ui/Icon';
import { useLesson } from '../../../contexts/LessonContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { speakText } from '../../../utils/ttsHelper';
import './StepStyles.css';

const McqStep = ({ step, index, avatarControl }) => {
  const { recordStepResult } = useLesson();
  const { profile } = useProfile();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (i) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleSubmit = async () => {
    if (selected === null) return;
    const correct = selected === step.correct_answer;
    const score = correct ? 100 : 0;
    recordStepResult(index, { correct, score, selected });
    setSubmitted(true);

    // Avatar reactions and TTS feedback
    if (correct) {
      // Celebrate!
      avatarControl?.celebrate();

      // Speak encouragement in English
      await speakText(
        "Nice! That's exactly right. Great job!",
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
      const feedback = step.explanation ||
        "Gần đúng rồi! Hãy đọc kỹ câu hỏi và thử lại nhé.";
      await speakText(feedback, 'vi', profile?.coach_id || 'ivy');

      // Reset avatar
      setTimeout(() => {
        avatarControl?.resetToIdle();
      }, 2000);
    }
  };

  const isCorrect = submitted && selected === step.correct_answer;
  const isWrong = submitted && selected !== step.correct_answer;

  return (
    <div className="lesson-card glass">
      <div className="step-tag mcq">
        <Icon name="listChecks" size="base" />
        Check understanding
      </div>

      <p className="question">{step.question}</p>

      <div className="options">
        {step.options.map((opt, i) => {
          const isThisCorrect = submitted && i === step.correct_answer;
          const isChosenWrong = submitted && i === selected && i !== step.correct_answer;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`
                option-btn
                ${selected === i ? 'selected' : ''}
                ${isThisCorrect ? 'correct' : ''}
                ${isChosenWrong ? 'wrong' : ''}
              `}
              disabled={submitted}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt}</span>
              {isThisCorrect && <Icon name="check" size="base" />}
              {isChosenWrong && <Icon name="x" size="base" />}
            </button>
          );
        })}
      </div>

      <div className="mcq-footer">
        {!submitted ? (
          <button
            className="btn-primary"
            disabled={selected === null}
            onClick={handleSubmit}
          >
            <Icon name="checkCircle" size="base" />
            Check answer
          </button>
        ) : (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              <Icon name={isCorrect ? 'sparkles' : 'brain'} size="xl" />
            </div>
            <div className="feedback-content">
              <p className="feedback-title">
                {isCorrect ? 'Perfect! 🎉' : 'Almost there! 💪'}
              </p>
              {step.explanation && (
                <p className="feedback-explanation">{step.explanation}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default McqStep;
