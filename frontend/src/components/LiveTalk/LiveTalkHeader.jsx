import Icon from '../ui/Icon';
import { BRAND } from '../../constants/branding';
import './LiveTalk.css';

const LiveTalkHeader = ({ coachName, onClearChat, onEndSession, sessionStats, hasMessages }) => {
  return (
    <div className="live-talk-header">
      <div className="header-left">
        <h2 className="header-title">Live Talk with {BRAND.NAME}</h2>
        <p className="header-subtitle">{BRAND.LIVE_TALK_SUBTITLE_EN}</p>
        <p className="header-subtitle-vi">{BRAND.LIVE_TALK_SUBTITLE_VI}</p>
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
