import { useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { getWeeklyGoal, updateWeeklyGoal } from '../../services/userDataService';
import Icon from '../../components/ui/Icon';
import './ProgressPage.css';

const WeeklyGoals = ({ goalProgress, onGoalUpdate }) => {
  const { profile } = useProfile();
  const userId = profile?.id || 'default_user';

  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(getWeeklyGoal(userId));

  const handleSaveGoal = () => {
    updateWeeklyGoal(userId, selectedGoal);
    setIsEditing(false);
    if (onGoalUpdate) {
      onGoalUpdate();
    }
  };

  const handleCancelEdit = () => {
    setSelectedGoal(getWeeklyGoal(userId));
    setIsEditing(false);
  };

  const goalOptions = [
    { value: 10, label: '10 min/day', total: 70 },
    { value: 15, label: '15 min/day', total: 105 },
    { value: 20, label: '20 min/day', total: 140 },
    { value: 30, label: '30 min/day', total: 210 }
  ];

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 80) return 'near-goal';
    if (percentage >= 50) return 'progress';
    return 'start';
  };

  const progressColor = getProgressColor(goalProgress.percentage);

  return (
    <div className="weekly-goals">
      <div className="goals-header">
        <div className="goals-title-group">
          <h2 className="goals-title">Weekly Goal Progress</h2>
          <p className="goals-subtitle">
            {goalProgress.current} / {goalProgress.target} minutes
          </p>
        </div>

        {!isEditing ? (
          <button
            className="btn-edit-goal"
            onClick={() => setIsEditing(true)}
          >
            <Icon name="settings" size="sm" />
            <span>Adjust Goal</span>
          </button>
        ) : (
          <div className="edit-goal-actions">
            <button className="btn-ghost-sm" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button className="btn-primary-sm" onClick={handleSaveGoal}>
              <Icon name="check" size="sm" />
              Save
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="goal-editor">
          <p className="editor-label">Select your daily speaking goal:</p>
          <div className="goal-options">
            {goalOptions.map(option => (
              <button
                key={option.value}
                className={`goal-option ${selectedGoal === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedGoal(option.value)}
              >
                <div className="option-main">{option.label}</div>
                <div className="option-total">{option.total} min/week</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="goal-progress-container">
            <div className="progress-bar-wrapper">
              <div
                className={`progress-bar-fill ${progressColor}`}
                style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
              >
                {goalProgress.percentage >= 10 && (
                  <span className="progress-percentage">
                    {goalProgress.percentage}%
                  </span>
                )}
              </div>
            </div>

            {goalProgress.percentage < 10 && (
              <span className="progress-percentage-outside">
                {goalProgress.percentage}%
              </span>
            )}
          </div>

          {/* Status Message */}
          <div className="goal-status">
            {goalProgress.percentage >= 100 ? (
              <div className="status-message success">
                <Icon name="trophy" size="base" />
                <span>Congratulations! You've reached your weekly goal!</span>
              </div>
            ) : goalProgress.percentage >= 80 ? (
              <div className="status-message near-goal">
                <Icon name="target" size="base" />
                <span>
                  Almost there! Just {goalProgress.target - goalProgress.current} more minutes to go!
                </span>
              </div>
            ) : goalProgress.percentage >= 50 ? (
              <div className="status-message progress">
                <Icon name="trendingUp" size="base" />
                <span>
                  Great progress! Keep it up to reach your {goalProgress.target} minute goal.
                </span>
              </div>
            ) : (
              <div className="status-message start">
                <Icon name="zap" size="base" />
                <span>
                  Let's go! {goalProgress.target - goalProgress.current} minutes to reach your weekly goal.
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyGoals;
