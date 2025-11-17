import Icon from '../../components/ui/Icon';
import './ProgressPage.css';

const InsightsPanel = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="insights-empty">
        <Icon name="info" size="lg" />
        <p>Keep practicing to unlock insights!</p>
      </div>
    );
  }

  const getInsightColor = (type) => {
    const colors = {
      success: 'insight-success',
      improvement: 'insight-improvement',
      achievement: 'insight-achievement',
      progress: 'insight-progress',
      consistency: 'insight-consistency',
      streak: 'insight-streak',
      warning: 'insight-warning'
    };
    return colors[type] || 'insight-default';
  };

  return (
    <div className="insights-grid">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`insight-card ${getInsightColor(insight.type)}`}
        >
          <div className="insight-icon">
            <Icon name={insight.icon} size="xl" />
          </div>

          <div className="insight-content">
            <p className="insight-message">{insight.message}</p>
            {insight.value && (
              <div className="insight-value">{insight.value}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;
