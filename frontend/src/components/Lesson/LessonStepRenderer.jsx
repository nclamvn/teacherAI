import WarmupStep from './steps/WarmupStep';
import DialogueStep from './steps/DialogueStep';
import McqStep from './steps/McqStep';
import BuildSentenceStep from './steps/BuildSentenceStep';
import SpeakingPromptStep from './steps/SpeakingPromptStep';

const LessonStepRenderer = ({ step, stepIndex, avatarControl }) => {
  if (!step) {
    return (
      <div className="lesson-card glass">
        <p>No step data available</p>
      </div>
    );
  }

  switch (step.type) {
    case 'warmup':
      return <WarmupStep step={step} index={stepIndex} avatarControl={avatarControl} />;
    case 'dialogue':
      return <DialogueStep step={step} index={stepIndex} avatarControl={avatarControl} />;
    case 'mcq':
      return <McqStep step={step} index={stepIndex} avatarControl={avatarControl} />;
    case 'build_sentence':
      return <BuildSentenceStep step={step} index={stepIndex} avatarControl={avatarControl} />;
    case 'speaking_prompt':
      return <SpeakingPromptStep step={step} index={stepIndex} avatarControl={avatarControl} />;
    default:
      return (
        <div className="lesson-card glass">
          <p>Unknown step type: {step.type}</p>
        </div>
      );
  }
};

export default LessonStepRenderer;
