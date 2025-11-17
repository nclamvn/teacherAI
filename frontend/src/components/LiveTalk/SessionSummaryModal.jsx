import Icon from '../ui/Icon';
import './LiveTalk.css';

const SessionSummaryModal = ({ summary, onClose }) => {
  if (!summary) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="session-summary-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="summary-modal-header">
          <div className="summary-modal-title">
            <Icon name="trophy" size="xl" />
            <h2>Session Complete!</h2>
          </div>
          <button className="summary-close-btn" onClick={onClose}>
            <Icon name="x" size="base" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="summary-stats-bar">
          <div className="summary-stat">
            <Icon name="messageCircle" size="sm" />
            <div className="summary-stat-content">
              <span className="summary-stat-value">{summary.turns}</span>
              <span className="summary-stat-label">turns</span>
            </div>
          </div>
          <div className="summary-stat">
            <Icon name="quote" size="sm" />
            <div className="summary-stat-content">
              <span className="summary-stat-value">{summary.total_words}</span>
              <span className="summary-stat-label">words</span>
            </div>
          </div>
          <div className="summary-stat">
            <Icon name="clock" size="sm" />
            <div className="summary-stat-content">
              <span className="summary-stat-value">{summary.duration_minutes}</span>
              <span className="summary-stat-label">minutes</span>
            </div>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="summary-content">
          {/* Strengths */}
          <div className="summary-section strengths">
            <div className="summary-section-header">
              <Icon name="sparkles" size="base" />
              <h3>What you did well</h3>
            </div>
            <p className="summary-section-text">{summary.strengths}</p>
          </div>

          {/* Good Sentences */}
          {summary.good_sentences && summary.good_sentences.length > 0 && (
            <div className="summary-section good-sentences">
              <div className="summary-section-header">
                <Icon name="checkCircle" size="base" />
                <h3>Great sentences you said</h3>
              </div>
              <ul className="good-sentences-list">
                {summary.good_sentences.map((sentence, index) => (
                  <li key={index} className="good-sentence-item">
                    <Icon name="quote" size="xs" />
                    <span>{sentence}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Improve */}
          <div className="summary-section weaknesses">
            <div className="summary-section-header">
              <Icon name="target" size="base" />
              <h3>Keep working on</h3>
            </div>
            <p className="summary-section-text">{summary.weaknesses}</p>
          </div>

          {/* Practice Suggestion */}
          <div className="summary-section practice-suggestion">
            <div className="summary-section-header">
              <Icon name="lightbulb" size="base" />
              <h3>Practice this</h3>
            </div>
            <div className="practice-suggestion-box">
              <p className="summary-section-text">{summary.practice_suggestion}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="summary-modal-actions">
          <button className="btn-summary-close" onClick={onClose}>
            <Icon name="check" size="base" />
            <span>Got it!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;
