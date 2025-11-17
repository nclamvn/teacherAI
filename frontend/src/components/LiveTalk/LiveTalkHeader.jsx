import Icon from '../ui/Icon';
import './LiveTalk.css';

const LiveTalkHeader = ({ coachName, onClearChat, onEndSession, sessionStats, hasMessages }) => {
  return (
    <div className="live-talk-header">
      <div className="header-left">
        <h2 className="header-title">Live Talk with Coach {coachName}</h2>
        <p className="header-subtitle">Free conversation practice</p>
      </div>

      <div className="header-actions">
        {hasMessages && (
          <button
            className="header-btn end-session-btn"
            onClick={onEndSession}
            title="End session & get feedback"
          >
            <Icon name="trophy" size="base" />
            <span>End Session</span>
          </button>
        )}
        <button
          className="header-btn"
          onClick={onClearChat}
          title="Clear conversation"
        >
          <Icon name="trash2" size="base" />
        </button>
      </div>
    </div>
  );
};

export default LiveTalkHeader;
