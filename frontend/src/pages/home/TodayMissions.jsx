import Icon from '../../components/ui/Icon';
import './HomePage.css';

const TodayMissions = ({ missions }) => {
  if (!missions || missions.length === 0) {
    return (
      <div className="missions-empty">
        <Icon name="check" size="2xl" />
        <p>Great! You've completed all missions for today!</p>
      </div>
    );
  }

  const getMissionColor = (type) => {
    const colors = {
      lesson: 'mission-purple',
      drill: 'mission-orange',
      phrases: 'mission-blue',
      conversation: 'mission-teal'
    };
    return colors[type] || 'mission-purple';
  };

  return (
    <div className="missions-grid">
      {missions.map((mission, index) => (
        <div
          key={mission.id}
          className={`mission-card ${getMissionColor(mission.type)}`}
          onClick={mission.action}
        >
          <div className="mission-number">{index + 1}</div>

          <div className="mission-icon">
            <Icon name={mission.icon} size="xl" />
          </div>

          <div className="mission-content">
            <h3 className="mission-title">{mission.title}</h3>
            <p className="mission-description">{mission.description}</p>
          </div>

          <div className="mission-footer">
            <div className="mission-duration">
              <Icon name="clock" size="sm" />
              <span>{mission.duration}</span>
            </div>
            {mission.count && (
              <div className="mission-count">
                {mission.count} items
              </div>
            )}
          </div>

          <button className="mission-cta">
            Start
            <Icon name="arrowRight" size="sm" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodayMissions;
