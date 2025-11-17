import { useEffect } from 'react';
import Icon from '../../ui/Icon';
import { useLesson } from '../../../contexts/LessonContext';
import { useStudio } from '../../../contexts/StudioContext';
import './StepStyles.css';

const SpeakingPromptStep = ({ step, index }) => {
  const { recordStepResult } = useLesson();
  const { switchToSpeakingLab } = useStudio();

  // Auto-mark as completed when viewed
  useEffect(() => {
    recordStepResult(index, { completed: true });
  }, [index, recordStepResult]);

  const handlePractice = () => {
    // Mark step as completed
    recordStepResult(index, { completed: true });

    // Switch to Speaking Lab with the topic from this step
    if (step.speaking_lab_topic) {
      switchToSpeakingLab(step.speaking_lab_topic);
    } else {
      // Fallback: switch without topic
      switchToSpeakingLab();
    }
  };

  return (
    <div className="lesson-card glass">
      <div className="step-tag speaking-prompt">
        <Icon name="mic" size="base" />
        Try speaking
      </div>

      <p className="prompt">{step.prompt}</p>

      {step.suggested_sentences && step.suggested_sentences.length > 0 && (
        <div className="suggested-sentences">
          <p className="suggested-label">
            <Icon name="lightbulb" size="base" />
            You can try:
          </p>
          <ul className="suggested-list">
            {step.suggested_sentences.map((sentence, i) => (
              <li key={i} className="suggested-item">
                <Icon name="quote" size="sm" />
                "{sentence}"
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="speaking-prompt-actions">
        <button className="btn-primary" onClick={handlePractice}>
          <Icon name="mic" size="base" />
          Practice in Speaking Lab
        </button>
        <p className="speaking-hint">
          <Icon name="info" size="sm" />
          This will open Speaking Lab where you can practice speaking
        </p>
      </div>
    </div>
  );
};

export default SpeakingPromptStep;
