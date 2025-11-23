import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import { useUserProgress } from '../../contexts/UserProgressContext';
import { useLesson } from '../../contexts/LessonContext';
import { BRAND } from '../../constants/branding';
import TodayMissions from './TodayMissions';
import DailyFocus from './DailyFocus';
import MiniProgress from './MiniProgress';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { weakWords, savedPhrases, getTopWeakWordsForPractice, getTodayPhrasesForPractice } = useUserProgress();
  const { currentLesson, lessonProgress } = useLesson();

  const [missions, setMissions] = useState([]);
  const [dailyFocus, setDailyFocus] = useState(null);

  // Calculate today's missions on mount
  useEffect(() => {
    calculateMissions();
    calculateDailyFocus();
  }, [weakWords, savedPhrases, lessonProgress]);

  const calculateMissions = () => {
    const todayMissions = [];

    // Mission 1: Continue lesson or start new one
    if (currentLesson && lessonProgress?.current_step < currentLesson?.steps?.length) {
      todayMissions.push({
        id: 'lesson',
        type: 'lesson',
        title: 'Continue Your Lesson',
        description: `${currentLesson.title} - Step ${lessonProgress.current_step + 1}/${currentLesson.steps.length}`,
        icon: 'book',
        duration: '5-10 min',
        priority: 1,
        action: () => navigate('/studio')
      });
    } else {
      todayMissions.push({
        id: 'lesson',
        type: 'lesson',
        title: 'Start a New Lesson',
        description: 'Learn new phrases and practice speaking',
        icon: 'book',
        duration: '10-15 min',
        priority: 1,
        action: () => navigate('/studio')
      });
    }

    // Mission 2: Practice weak words (if any)
    const topWeakWords = getTopWeakWordsForPractice(3);
    if (topWeakWords.length > 0) {
      todayMissions.push({
        id: 'weak-words',
        type: 'drill',
        title: 'Practice Weak Sounds',
        description: `${topWeakWords.length} words need attention: ${topWeakWords.slice(0, 2).map(w => w.word).join(', ')}${topWeakWords.length > 2 ? '...' : ''}`,
        icon: 'target',
        duration: '3-5 min',
        priority: 2,
        count: topWeakWords.length,
        action: () => navigate('/studio')
      });
    }

    // Mission 3: Practice phrases OR do Live Talk
    const todayPhrases = getTodayPhrasesForPractice(3);
    if (todayPhrases.length > 0) {
      todayMissions.push({
        id: 'phrases',
        type: 'phrases',
        title: 'Practice Your Phrases',
        description: `${todayPhrases.length} saved phrases ready to practice`,
        icon: 'messageSquare',
        duration: '3-5 min',
        priority: 3,
        count: todayPhrases.length,
        action: () => {
          navigate('/studio');
          // TODO: Switch to phrases panel when implemented in Studio
        }
      });
    } else {
      todayMissions.push({
        id: 'live-talk',
        type: 'conversation',
        title: 'Quick Conversation',
        description: 'Practice speaking with your AI coach',
        icon: 'mic',
        duration: '5 min',
        priority: 3,
        action: () => navigate('/studio')
      });
    }

    setMissions(todayMissions.sort((a, b) => a.priority - b.priority));
  };

  const calculateDailyFocus = () => {
    // Find the most common error pattern this week
    const errorPatterns = weakWords.reduce((acc, word) => {
      const pattern = word.error_type || 'substitution';
      acc[pattern] = (acc[pattern] || 0) + word.error_count;
      return acc;
    }, {});

    if (Object.keys(errorPatterns).length > 0) {
      const topPattern = Object.entries(errorPatterns)
        .sort(([, a], [, b]) => b - a)[0];

      const [errorType, count] = topPattern;
      const affectedWords = weakWords
        .filter(w => w.error_type === errorType)
        .slice(0, 3);

      setDailyFocus({
        errorType,
        count,
        words: affectedWords.map(w => w.word),
        tip: getFocusTip(errorType)
      });
    }
  };

  const getFocusTip = (errorType) => {
    const tips = {
      substitution: "Focus on distinguishing similar sounds. Listen carefully and repeat slowly.",
      deletion: "Don't skip sounds at the end of words. Practice pronouncing complete words.",
      insertion: "Avoid adding extra sounds. Keep it simple and clear."
    };
    return tips[errorType] || "Practice makes perfect! Focus on clarity.";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div className="greeting-section">
          <p className="welcome-badge">{BRAND.WELCOME_VI}</p>
          <h1 className="greeting">
            {getGreeting()}, {profile?.name || 'Learner'}! 👋
          </h1>
          <p className="tagline">{BRAND.HOME_DESCRIPTION_EN}</p>
          <p className="tagline-vi">{BRAND.HOME_DESCRIPTION_VI}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="home-content">
        {/* Today's Missions */}
        <section className="home-section missions-section">
          <div className="section-header">
            <h2 className="section-title">Today's Mission</h2>
            <p className="section-subtitle">Complete these 3 tasks in ~15 minutes</p>
          </div>
          <TodayMissions missions={missions} />
        </section>

        {/* Daily Focus */}
        {dailyFocus && (
          <section className="home-section focus-section">
            <DailyFocus focus={dailyFocus} />
          </section>
        )}

        {/* Mini Progress */}
        <section className="home-section progress-section">
          <MiniProgress />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
