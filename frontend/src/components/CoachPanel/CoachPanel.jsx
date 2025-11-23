import Icon from '../ui/Icon';
import AvatarContainer from '../Avatar/AvatarContainer';
import { BRAND } from '../../constants/branding';
import './CoachPanel.css';

const CoachPanel = ({ avatarState, onAvatarStateChange }) => {
  return (
    <div className="coach-panel">
      {/* Coach Card - Avatar + Header */}
      <div className="coach-card glass">
        <div className="coach-header">
          <h3 className="coach-name gradient-text">{BRAND.NAME}</h3>
          <p className="coach-subtitle">{BRAND.TAGLINE_EN}</p>
          <p className="coach-subtitle-vi">{BRAND.TAGLINE_VI}</p>
        </div>

        <div className="coach-avatar-section">
          <AvatarContainer
            externalState={avatarState}
            onExternalStateChange={onAvatarStateChange}
            showDebugLabel={false}
            autoReset={true}
          />
        </div>
      </div>

      {/* Stats Card */}
      <div className="coach-stats glass">
        <div className="stat-item">
          <div className="stat-icon">
            <Icon name="flame" size="xl" />
          </div>
          <div className="stat-content">
            <div className="stat-value">7</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Icon name="trending" size="xl" />
          </div>
          <div className="stat-content">
            <div className="stat-value">68%</div>
            <div className="stat-label">Today's Progress</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <Icon name="sparkles" size="xl" />
          </div>
          <div className="stat-content">
            <div className="stat-value">240</div>
            <div className="stat-label">Total XP</div>
          </div>
        </div>
      </div>

      {/* Message Card */}
      <div className="coach-message glass glass-hover">
        <div className="message-bubble">
          <p className="message-text">
            "Great progress today! Let's continue with healthy eating vocabulary."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoachPanel;
