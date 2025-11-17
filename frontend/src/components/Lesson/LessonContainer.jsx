import { useLesson } from '../../contexts/LessonContext';
import LessonHeader from './LessonHeader';
import LessonStepRenderer from './LessonStepRenderer';
import NavigationButtons from '../shared/NavigationButtons';
import './LessonContainer.css';

const LessonContainer = ({ avatarControl }) => {
  const {
    currentLesson,
    currentStep,
    currentStepIndex,
    progress,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    completeLesson,
    isLoading,
  } = useLesson();

  if (isLoading) {
    return (
      <div className="lesson-container">
        <div className="lesson-card glass skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-content"></div>
          <div className="skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="lesson-container">
        <div className="lesson-card glass">
          <div className="empty-state">
            <p className="empty-text">No lesson available for today.</p>
            <p className="empty-subtext">Check back later or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-container">
      <LessonHeader
        title={currentLesson.title}
        estimatedMinutes={currentLesson.estimated_minutes}
        currentStepIndex={currentStepIndex}
        totalSteps={currentLesson.steps.length}
        progress={progress}
        topic={currentLesson.topic}
      />

      <LessonStepRenderer
        step={currentStep}
        stepIndex={currentStepIndex}
        avatarControl={avatarControl}
      />

      <NavigationButtons
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onPrev={previousStep}
        onNext={nextStep}
        onComplete={completeLesson}
        avatarControl={avatarControl}
      />
    </div>
  );
};

export default LessonContainer;
