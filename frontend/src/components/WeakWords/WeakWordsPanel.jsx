import { useState } from 'react';
import { useUserProgress } from '../../contexts/UserProgressContext';
import Icon from '../ui/Icon';
import MiniDrillModal from './MiniDrillModal';
import './WeakWordsPanel.css';

const WeakWordsPanel = () => {
  const { weakWords, masteredWords, deleteWeakWord, deleteMasteredWord, getTopWeakWordsForPractice } = useUserProgress();
  const [selectedWord, setSelectedWord] = useState(null);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [showAllMastered, setShowAllMastered] = useState(false);

  const topWeakWords = getTopWeakWordsForPractice(5);
  const displayedMasteredWords = showAllMastered ? masteredWords : masteredWords.slice(0, 3);

  const handlePracticeWord = (word) => {
    setSelectedWord(word);
    setShowDrillModal(true);
  };

  const handleDeleteWord = (wordText, e) => {
    e.stopPropagation();
    if (confirm(`Remove "${wordText}" from weak words list?`)) {
      deleteWeakWord(wordText);
    }
  };

  const handleDeleteMasteredWord = (wordText, e) => {
    e.stopPropagation();
    if (confirm(`Remove "${wordText}" from mastered words list?`)) {
      deleteMasteredWord(wordText);
    }
  };

  const getErrorBadgeColor = (errorType) => {
    switch (errorType) {
      case 'substitution':
        return 'badge-orange';
      case 'deletion':
        return 'badge-red';
      case 'mispronunciation':
        return 'badge-purple';
      default:
        return 'badge-gray';
    }
  };

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case 'substitution':
        return 'arrowRight';
      case 'deletion':
        return 'x';
      case 'mispronunciation':
        return 'volume2';
      default:
        return 'alert';
    }
  };

  return (
    <div className="weak-words-panel">
      <div className="weak-words-header">
        <div className="weak-words-title">
          <Icon name="target" size="lg" />
          <h3>My Weak Sounds</h3>
        </div>
        <div className="weak-words-count">
          {weakWords.length} word{weakWords.length !== 1 ? 's' : ''}
        </div>
      </div>

      {topWeakWords.length === 0 ? (
        <div className="weak-words-empty">
          <Icon name="checkCircle" size="xl" />
          <p>No weak words yet!</p>
          <span className="empty-subtitle">
            Practice in Speaking Lab to identify areas for improvement
          </span>
        </div>
      ) : (
        <div className="weak-words-list">
          {topWeakWords.map((item, index) => (
            <div
              key={index}
              className="weak-word-item"
              onClick={() => handlePracticeWord(item)}
            >
              <div className="weak-word-rank">#{index + 1}</div>

              <div className="weak-word-content">
                <div className="weak-word-main">
                  <span className="weak-word-text">{item.word}</span>
                  <span className={`error-badge ${getErrorBadgeColor(item.error_type)}`}>
                    <Icon name={getErrorIcon(item.error_type)} size="xs" />
                    {item.error_type}
                  </span>
                </div>

                <div className="weak-word-meta">
                  <span className="error-count">
                    <Icon name="flame" size="xs" />
                    {item.error_count} error{item.error_count !== 1 ? 's' : ''}
                  </span>
                  <span className="last-practiced">
                    Last practiced: {new Date(item.last_practiced).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="weak-word-actions">
                <button
                  className="practice-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePracticeWord(item);
                  }}
                  title="Practice this word"
                >
                  <Icon name="play" size="sm" />
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteWord(item.word, e)}
                  title="Remove from list"
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {weakWords.length > 5 && (
        <div className="weak-words-footer">
          <p className="footer-note">
            Showing top 5 · {weakWords.length - 5} more in your list
          </p>
        </div>
      )}

      {/* Mastered Words Section */}
      {masteredWords.length > 0 && (
        <div className="mastered-words-section">
          <div className="mastered-words-header">
            <div className="mastered-words-title">
              <Icon name="sparkles" size="base" />
              <h4>Mastered Words</h4>
            </div>
            <div className="mastered-words-count">
              {masteredWords.length} word{masteredWords.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="mastered-words-list">
            {displayedMasteredWords.map((item, index) => (
              <div key={index} className="mastered-word-item">
                <div className="mastered-word-icon">✨</div>

                <div className="mastered-word-content">
                  <div className="mastered-word-text">{item.word}</div>
                  <div className="mastered-word-meta">
                    Mastered on {new Date(item.mastered_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  className="delete-mastered-btn"
                  onClick={(e) => handleDeleteMasteredWord(item.word, e)}
                  title="Remove from mastered list"
                >
                  <Icon name="x" size="xs" />
                </button>
              </div>
            ))}
          </div>

          {masteredWords.length > 3 && (
            <button
              className="show-all-mastered-btn"
              onClick={() => setShowAllMastered(!showAllMastered)}
            >
              {showAllMastered ? 'Show Less' : `Show All ${masteredWords.length} Words`}
            </button>
          )}
        </div>
      )}

      {/* Mini Drill Modal */}
      {showDrillModal && selectedWord && (
        <MiniDrillModal
          word={selectedWord}
          onClose={() => {
            setShowDrillModal(false);
            setSelectedWord(null);
          }}
        />
      )}
    </div>
  );
};

export default WeakWordsPanel;
