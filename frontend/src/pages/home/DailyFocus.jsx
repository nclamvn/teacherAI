import Icon from '../../components/ui/Icon';
import './HomePage.css';

const DailyFocus = ({ focus }) => {
  if (!focus) return null;

  const getErrorTypeLabel = (errorType) => {
    const labels = {
      substitution: 'Sound Confusion',
      deletion: 'Missing Sounds',
      insertion: 'Extra Sounds'
    };
    return labels[errorType] || 'Pronunciation Pattern';
  };

  const getErrorTypeIcon = (errorType) => {
    const icons = {
      substitution: 'target',
      deletion: 'alert',
      insertion: 'zap'
    };
    return icons[errorType] || 'target';
  };

  return (
    <div className="daily-focus-card">
      <div className="focus-header">
        <div className="focus-icon-wrapper">
          <Icon name={getErrorTypeIcon(focus.errorType)} size="lg" />
        </div>
        <div className="focus-title-group">
          <h3 className="focus-title">Focus of the Day</h3>
          <p className="focus-subtitle">{getErrorTypeLabel(focus.errorType)}</p>
        </div>
      </div>

      <div className="focus-content">
        <div className="focus-words">
          <span className="focus-label">Practice these sounds:</span>
          <div className="focus-words-list">
            {focus.words.map((word, index) => (
              <span key={index} className="focus-word-chip">
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="focus-tip">
          <Icon name="lightbulb" size="sm" />
          <p>{focus.tip}</p>
        </div>
      </div>

      <div className="focus-stats">
        <Icon name="trending" size="sm" />
        <span>{focus.count} occurrences this week</span>
      </div>
    </div>
  );
};

export default DailyFocus;
