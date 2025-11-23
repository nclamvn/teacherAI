import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLesson } from '../../contexts/LessonContext';
import { useStudio } from '../../contexts/StudioContext';
import { useUserProgress } from '../../contexts/UserProgressContext';
import Icon from '../../components/ui/Icon';
import CoachPanel from '../../components/CoachPanel/CoachPanel';
import LessonContainer from '../../components/Lesson/LessonContainer';
import SpeakingLab from '../../components/SpeakingLab/SpeakingLab';
import LiveTalkContainer from '../../components/LiveTalk/LiveTalkContainer';
import TimelinePanel from '../../components/Timeline/TimelinePanel';
import WeakWordsPanel from '../../components/WeakWords/WeakWordsPanel';
import { useAvatarState } from '../../hooks/useAvatarState';
import { BRAND } from '../../constants/branding';
import '../../App.css';

const StudioPage = () => {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, speakingTopic } = useStudio();
  const [lessonComplete, setLessonComplete] = useState(false);
  const avatarControl = useAvatarState();
  const { loadTodaysLesson } = useLesson();
  const { weakWords } = useUserProgress();

  useEffect(() => {
    // Load today's lesson when component mounts or when lesson tab becomes active
    if (activeTab === 'lesson') {
      loadTodaysLesson();
    }
  }, [activeTab, loadTodaysLesson]);

  const handleAnswerSubmit = (isCorrect) => {
    setLessonComplete(isCorrect);
  };

  return (
    <div className="app">
      {/* Header - Compact sticky navigation */}
      <header className="app-header">
        <div className="header-inner">
          <button className="btn-back-home" onClick={() => navigate('/home')}>
            <Icon name="arrowLeft" size="base" />
            <span>Home</span>
          </button>
          <div className="header-tabs">
            <button
              className={`tab-button ${activeTab === 'lesson' ? 'active' : ''}`}
              onClick={() => setActiveTab('lesson')}
            >
              <Icon name="lessons" size="base" />
              <span>Lesson</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'speaking' ? 'active' : ''}`}
              onClick={() => setActiveTab('speaking')}
            >
              <Icon name="speakingLab" size="base" />
              <span>Speaking Lab</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'liveTalk' ? 'active' : ''}`}
              onClick={() => setActiveTab('liveTalk')}
            >
              <Icon name="messageCircle" size="base" />
              <span>Live Talk</span>
            </button>
          </div>
        </div>
      </header>

      {/* Weak Words Reminder Banner */}
      {activeTab === 'lesson' && weakWords.length > 0 && (
        <div className="weak-words-reminder">
          <div className="reminder-content">
            <div className="reminder-icon">
              <Icon name="target" size="lg" />
            </div>
            <div className="reminder-text">
              <div className="reminder-title">Practice Time!</div>
              <div className="reminder-subtitle">
                You have {weakWords.length} weak word{weakWords.length !== 1 ? 's' : ''} to practice
              </div>
            </div>
          </div>
          <button
            className="reminder-action-btn"
            onClick={() => setActiveTab('speaking')}
          >
            <Icon name="play" size="base" />
            <span>Practice Now</span>
          </button>
        </div>
      )}

      {/* Main Layout - 3 Columns */}
      <main className="app-main">
        {activeTab === 'liveTalk' ? (
          /* Full-width layout for Live Talk (has built-in avatar panel) */
          <LiveTalkContainer />
        ) : (
          <div className="main-grid">
            {/* Left Column - Coach Panel */}
            <aside className={`grid-column coach-column ${activeTab === 'speaking' ? 'compact' : ''}`}>
              <CoachPanel
                avatarState={avatarControl.state}
                onAvatarStateChange={avatarControl}
              />
            </aside>

            {/* Center Column - Dynamic Content */}
            <section className="grid-column lesson-column">
              {activeTab === 'lesson' && (
                <LessonContainer avatarControl={avatarControl} />
              )}
              {activeTab === 'speaking' && (
                <SpeakingLab
                  onAvatarStateChange={avatarControl}
                  topic={speakingTopic}
                />
              )}
            </section>

            {/* Right Column - Timeline Panel or Weak Words Panel */}
            <aside className="grid-column timeline-column">
              {activeTab === 'speaking' ? (
                <WeakWordsPanel />
              ) : (
                <TimelinePanel />
              )}
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <span>{BRAND.COPYRIGHT}</span>
          <span>{BRAND.POWERED_BY_EN} | {BRAND.POWERED_BY_VI}</span>
        </div>
      </footer>
    </div>
  );
};

export default StudioPage;
