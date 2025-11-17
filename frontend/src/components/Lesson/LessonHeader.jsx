import Icon from '../ui/Icon';
import './LessonHeader.css';

const LessonHeader = ({
  title,
  estimatedMinutes,
  currentStepIndex,
  totalSteps,
  progress,
  topic,
}) => {
  // Format topic for display
  const formattedTopic = topic ? topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  return (
    <div className="lesson-header glass">
      <div className="lesson-header-main">
        <div className="lesson-title-block">
          <span className="lesson-label">
            <Icon name="bookOpen" size="sm" />
            Today's Lesson
          </span>
          <h2 className="lesson-title">{title}</h2>
          <div className="lesson-meta">
            <span className="lesson-chip">
              <Icon name="clock" size="sm" />
              ≈ {estimatedMinutes} min
            </span>
            {topic && (
              <span className="lesson-chip topic">
                <Icon name="tag" size="sm" />
                {formattedTopic}
              </span>
            )}
          </div>
        </div>

        <div className="lesson-step-indicator">
          <span className="step-text">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
