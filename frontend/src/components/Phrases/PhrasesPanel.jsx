import { useState } from 'react';
import { useUserProgress } from '../../contexts/UserProgressContext';
import Icon from '../ui/Icon';
import PhraseDrillModal from './PhraseDrillModal';
import './PhrasesPanel.css';

const PhrasesPanel = () => {
  const {
    savedPhrases,
    getTodayPhrasesForPractice,
    getPhrasesByStatus,
    deleteSavedPhrase
  } = useUserProgress();

  const [activeFilter, setActiveFilter] = useState('all');
  const [showMastered, setShowMastered] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState(null);

  // Get categorized phrases
  const todayPhrases = getTodayPhrasesForPractice(3);
  const weakPhrases = getPhrasesByStatus('weak');
  const learningPhrases = getPhrasesByStatus('learning');
  const masteredPhrases = getPhrasesByStatus('mastered');

  // Filter phrases for "All Phrases" section
  const getFilteredPhrases = () => {
    if (activeFilter === 'all') {
      return savedPhrases.filter(p => p.status !== 'mastered');
    } else if (activeFilter === 'weak') {
      return weakPhrases;
    } else if (activeFilter === 'learning') {
      return learningPhrases;
    }
    return [];
  };

  const filteredPhrases = getFilteredPhrases();

  const handlePlayPhrase = (phrase) => {
    // Use Web Speech API for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.text_en);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePracticePhrase = (phrase) => {
    setSelectedPhrase(phrase);
  };

  const handleDeletePhrase = (phrase) => {
    if (confirm(`Delete "${phrase.text_en}"?`)) {
      deleteSavedPhrase(phrase.id);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'weak') return 'status-weak';
    if (status === 'learning') return 'status-learning';
    if (status === 'mastered') return 'status-mastered';
    return '';
  };

  const getSourceBadgeClass = (source) => {
    if (source === 'lesson') return 'source-lesson';
    if (source === 'live_talk') return 'source-livetalk';
    if (source === 'speaking_lab') return 'source-lab';
    return 'source-manual';
  };

  const renderPhraseItem = (phrase) => (
    <div key={phrase.id} className="phrase-item">
      <div className="phrase-content">
        <div className="phrase-text-group">
          <div className="phrase-text-en">{phrase.text_en}</div>
          {phrase.text_vi && (
            <div className="phrase-text-vi">{phrase.text_vi}</div>
          )}
        </div>

        <div className="phrase-meta">
          {phrase.topic && (
            <span className="phrase-topic">
              <Icon name="tag" size="xs" />
              {phrase.topic.replace(/_/g, ' ')}
            </span>
          )}
          <span className={`phrase-source ${getSourceBadgeClass(phrase.source)}`}>
            {phrase.source === 'lesson' && 'From Lesson'}
            {phrase.source === 'live_talk' && 'From Live Talk'}
            {phrase.source === 'speaking_lab' && 'From Speaking Lab'}
            {phrase.source === 'manual' && 'Manual'}
          </span>
          <span className={`phrase-status ${getStatusBadgeClass(phrase.status)}`}>
            {phrase.status}
          </span>
        </div>

        <div className="phrase-stats">
          <span className="stat-item">
            <Icon name="repeat" size="xs" />
            {phrase.practice_count}x practiced
          </span>
          {phrase.avg_score > 0 && (
            <span className="stat-item">
              <Icon name="target" size="xs" />
              {phrase.avg_score}% avg
            </span>
          )}
          {phrase.success_streak > 0 && (
            <span className="stat-item">
              <Icon name="flame" size="xs" />
              {phrase.success_streak} streak
            </span>
          )}
        </div>
      </div>

      <div className="phrase-actions">
        <button
          className="phrase-action-btn play-btn"
          onClick={() => handlePlayPhrase(phrase)}
          title="Listen"
        >
          <Icon name="volume2" size="base" />
        </button>
        <button
          className="phrase-action-btn practice-btn"
          onClick={() => handlePracticePhrase(phrase)}
          title="Practice"
        >
          <Icon name="mic" size="base" />
        </button>
        <button
          className="phrase-action-btn delete-btn"
          onClick={() => handleDeletePhrase(phrase)}
          title="Delete"
        >
          <Icon name="trash2" size="base" />
        </button>
      </div>
    </div>
  );

  if (savedPhrases.length === 0) {
    return (
      <div className="phrases-panel">
        <div className="phrases-empty-state">
          <Icon name="messageSquare" size="2xl" />
          <h3>No saved phrases yet</h3>
          <p>Start saving phrases from lessons and conversations to build your personal phrase bank!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phrases-panel">
      {/* Header */}
      <div className="phrases-header">
        <div className="phrases-title-group">
          <Icon name="bookmark" size="lg" />
          <div>
            <h2 className="phrases-title">My Phrases</h2>
            <p className="phrases-subtitle">
              {savedPhrases.length} saved • Practice makes perfect
            </p>
          </div>
        </div>
      </div>

      {/* Today's Phrases Section */}
      {todayPhrases.length > 0 && (
        <div className="phrases-section">
          <div className="section-header">
            <Icon name="star" size="base" />
            <h3 className="section-title">Practice Today</h3>
            <span className="section-badge">{todayPhrases.length}</span>
          </div>
          <div className="phrases-list">
            {todayPhrases.map(phrase => renderPhraseItem(phrase))}
          </div>
        </div>
      )}

      {/* All Phrases Section */}
      <div className="phrases-section">
        <div className="section-header">
          <Icon name="list" size="base" />
          <h3 className="section-title">All Phrases</h3>
          <div className="filter-chips">
            <button
              className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-chip ${activeFilter === 'weak' ? 'active' : ''}`}
              onClick={() => setActiveFilter('weak')}
            >
              Weak ({weakPhrases.length})
            </button>
            <button
              className={`filter-chip ${activeFilter === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveFilter('learning')}
            >
              Learning ({learningPhrases.length})
            </button>
          </div>
        </div>

        <div className="phrases-list">
          {filteredPhrases.length > 0 ? (
            filteredPhrases.map(phrase => renderPhraseItem(phrase))
          ) : (
            <div className="phrases-empty-filter">
              <Icon name="searchX" size="lg" />
              <p>No {activeFilter} phrases found</p>
            </div>
          )}
        </div>
      </div>

      {/* Mastered Phrases Section */}
      {masteredPhrases.length > 0 && (
        <div className="phrases-section mastered-section">
          <div
            className="section-header collapsible"
            onClick={() => setShowMastered(!showMastered)}
          >
            <Icon name="trophy" size="base" />
            <h3 className="section-title">Mastered Phrases</h3>
            <span className="section-badge">{masteredPhrases.length}</span>
            <button className="collapse-btn">
              <Icon name={showMastered ? 'chevronUp' : 'chevronDown'} size="sm" />
            </button>
          </div>

          {showMastered && (
            <div className="phrases-list">
              {masteredPhrases.map(phrase => renderPhraseItem(phrase))}
            </div>
          )}
        </div>
      )}

      {/* Phrase Drill Modal */}
      {selectedPhrase && (
        <PhraseDrillModal
          phrase={selectedPhrase}
          onClose={() => setSelectedPhrase(null)}
        />
      )}
    </div>
  );
};

export default PhrasesPanel;
