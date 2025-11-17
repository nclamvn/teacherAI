import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../../contexts/UserProgressContext';
import Icon from '../../components/ui/Icon';
import './HomePage.css';

const MiniProgress = () => {
  const navigate = useNavigate();
  const { weakWords, masteredWords, savedPhrases } = useUserProgress();
  const [todayStats, setTodayStats] = useState({
    speakingMinutes: 0,
    wordsPromoted: 0,
    phrasesAdded: 0,
    practiceStreak: 0
  });

  useEffect(() => {
    calculateTodayStats();
  }, [weakWords, masteredWords, savedPhrases]);

  const calculateTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count words promoted to mastered today
    const wordsPromotedToday = masteredWords.filter(w => {
      const masteredDate = new Date(w.mastered_at);
      masteredDate.setHours(0, 0, 0, 0);
      return masteredDate.getTime() === today.getTime();
    }).length;

    // Count phrases added today
    const phrasesAddedToday = savedPhrases.filter(p => {
      const createdDate = new Date(p.created_at);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    }).length;

    // Calculate speaking streak (simplified - could be enhanced with actual session data)
    const hasActivity = wordsPromotedToday > 0 || phrasesAddedToday > 0;
    const streak = hasActivity ? 1 : 0; // Simplified for now

    // Estimate speaking minutes (simplified calculation)
    const estimatedMinutes = (wordsPromotedToday * 2) + (phrasesAddedToday * 3);

    setTodayStats({
      speakingMinutes: Math.min(estimatedMinutes, 60), // Cap at 60 for display
      wordsPromoted: wordsPromotedToday,
      phrasesAdded: phrasesAddedToday,
      practiceStreak: streak
    });
  };

  const stats = [
    {
      id: 'speaking',
      icon: 'mic',
      value: todayStats.speakingMinutes,
      unit: 'min',
      label: 'Speaking today',
      color: 'stat-purple'
    },
    {
      id: 'promoted',
      icon: 'trophy',
      value: todayStats.wordsPromoted,
      unit: 'words',
      label: 'Promoted to mastered',
      color: 'stat-green'
    },
    {
      id: 'phrases',
      icon: 'bookmark',
      value: savedPhrases.length,
      unit: 'total',
      label: 'Saved phrases',
      color: 'stat-blue'
    },
    {
      id: 'weak',
      icon: 'target',
      value: weakWords.length,
      unit: 'to practice',
      label: 'Weak words',
      color: 'stat-orange'
    }
  ];

  return (
    <div className="mini-progress">
      <div className="progress-header">
        <h3 className="progress-title">Your Progress</h3>
        <p className="progress-subtitle">Keep up the great work!</p>
      </div>

      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <Icon name={stat.icon} size="base" />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stat.value}
                <span className="stat-unit">{stat.unit}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {todayStats.speakingMinutes > 0 && (
        <div className="progress-encouragement">
          <Icon name="sparkles" size="sm" />
          <p>
            {todayStats.speakingMinutes >= 15
              ? "Amazing! You've hit your daily goal! 🎉"
              : `Just ${15 - todayStats.speakingMinutes} more minutes to reach your daily goal!`}
          </p>
        </div>
      )}

      <button
        className="btn-view-progress"
        onClick={() => navigate('/progress')}
      >
        <Icon name="barChart" size="base" />
        <span>View Weekly Progress</span>
        <Icon name="arrowRight" size="sm" />
      </button>
    </div>
  );
};

export default MiniProgress;
