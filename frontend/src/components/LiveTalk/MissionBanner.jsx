import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import './LiveTalk.css';

const MissionBanner = ({ topic, focusWord, onClearFocus }) => {
  const [mission, setMission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // If there's a focus word, create a custom mission for it
    if (focusWord) {
      setMission({
        icon: 'target',
        mission: `Practice using the word "${focusWord}" in natural conversation`,
        focus_grammar: 'Natural word usage in context',
        sample_phrases: [
          `Try using "${focusWord}" in a sentence`,
          'Talk about situations where you might use this word',
          'Ask the coach about different ways to use it'
        ]
      });
      setIsLoading(false);
      setIsCollapsed(false);
      return;
    }

    // Otherwise, fetch mission from API
    const fetchMission = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/live-talk/mission?topic=${topic}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch mission');
        }

        const data = await response.json();
        setMission(data);
      } catch (error) {
        console.error('Error fetching mission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (topic) {
      fetchMission();
    }
  }, [topic, focusWord]);

  if (isLoading || !mission) {
    return null;
  }

  return (
    <div className={`mission-banner ${isCollapsed ? 'collapsed' : ''} ${focusWord ? 'focus-word' : ''}`}>
      <div className="mission-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="mission-icon-title">
          <Icon name={mission.icon} size="base" />
          <h3 className="mission-title">
            {focusWord ? 'Word Practice Mission' : 'Today\'s Mission'}
          </h3>
        </div>
        <div className="mission-actions">
          {focusWord && onClearFocus && (
            <button
              className="mission-close"
              onClick={(e) => {
                e.stopPropagation();
                onClearFocus();
              }}
              aria-label="Clear focus word"
            >
              <Icon name="x" size="sm" />
            </button>
          )}
          <button className="mission-toggle" aria-label={isCollapsed ? 'Expand' : 'Collapse'}>
            <Icon name={isCollapsed ? 'chevronDown' : 'chevronUp'} size="sm" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mission-content">
          <div className="mission-main">
            <Icon name="target" size="sm" />
            <p className="mission-description">{mission.mission}</p>
          </div>

          <div className="mission-details">
            <div className="mission-detail-item">
              <Icon name="brain" size="xs" />
              <div className="mission-detail-content">
                <span className="mission-detail-label">Focus Grammar:</span>
                <span className="mission-detail-value">{mission.focus_grammar}</span>
              </div>
            </div>

            {mission.sample_phrases && mission.sample_phrases.length > 0 && (
              <div className="mission-phrases">
                <div className="mission-phrases-header">
                  <Icon name="quote" size="xs" />
                  <span>Sample phrases:</span>
                </div>
                <ul className="mission-phrases-list">
                  {mission.sample_phrases.map((phrase, index) => (
                    <li key={index} className="mission-phrase-item">
                      {phrase}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionBanner;
