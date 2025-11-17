import Icon from '../../components/ui/Icon';
import './ProgressPage.css';

const WeeklyStatsCards = ({ thisWeek, lastWeek }) => {
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100' : '0';
    const change = current - previous;
    const percentage = Math.round((change / previous) * 100);
    return percentage > 0 ? `+${percentage}` : percentage.toString();
  };

  const getChangeColor = (current, previous) => {
    if (current > previous) return 'positive';
    if (current < previous) return 'negative';
    return 'neutral';
  };

  const stats = [
    {
      id: 'speaking',
      icon: 'mic',
      label: 'Speaking Time',
      value: thisWeek.speakingMinutes,
      unit: 'minutes',
      color: 'stat-purple',
      change: calculateChange(thisWeek.speakingMinutes, lastWeek.speakingMinutes),
      changeType: getChangeColor(thisWeek.speakingMinutes, lastWeek.speakingMinutes)
    },
    {
      id: 'words',
      icon: 'award',
      label: 'Words Mastered',
      value: thisWeek.wordsMastered,
      unit: 'words',
      color: 'stat-green',
      change: calculateChange(thisWeek.wordsMastered, lastWeek.wordsMastered),
      changeType: getChangeColor(thisWeek.wordsMastered, lastWeek.wordsMastered)
    },
    {
      id: 'phrases',
      icon: 'bookmark',
      label: 'Phrases Saved',
      value: thisWeek.phrasesSaved,
      unit: 'phrases',
      color: 'stat-blue',
      change: calculateChange(thisWeek.phrasesSaved, lastWeek.phrasesSaved),
      changeType: getChangeColor(thisWeek.phrasesSaved, lastWeek.phrasesSaved)
    },
    {
      id: 'score',
      icon: 'trendingUp',
      label: 'Avg Pronunciation',
      value: thisWeek.avgScore,
      unit: '%',
      color: 'stat-teal',
      change: calculateChange(thisWeek.avgScore, lastWeek.avgScore),
      changeType: getChangeColor(thisWeek.avgScore, lastWeek.avgScore)
    },
    {
      id: 'active',
      icon: 'calendar',
      label: 'Active Days',
      value: thisWeek.activeDays,
      unit: '/ 7',
      color: 'stat-orange',
      change: calculateChange(thisWeek.activeDays, lastWeek.activeDays),
      changeType: getChangeColor(thisWeek.activeDays, lastWeek.activeDays)
    },
    {
      id: 'streak',
      icon: 'fire',
      label: 'Practice Streak',
      value: thisWeek.streak,
      unit: 'days',
      color: 'stat-red',
      showChange: false // Streak doesn't compare week-over-week
    }
  ];

  return (
    <div className="weekly-stats-grid">
      {stats.map(stat => (
        <div key={stat.id} className={`weekly-stat-card ${stat.color}`}>
          <div className="stat-card-icon">
            <Icon name={stat.icon} size="lg" />
          </div>

          <div className="stat-card-content">
            <div className="stat-card-value">
              {stat.value}
              <span className="stat-card-unit">{stat.unit}</span>
            </div>
            <div className="stat-card-label">{stat.label}</div>

            {stat.showChange !== false && stat.change !== '0' && (
              <div className={`stat-card-change ${stat.changeType}`}>
                {stat.changeType === 'positive' && <Icon name="arrowUp" size="xs" />}
                {stat.changeType === 'negative' && <Icon name="arrowDown" size="xs" />}
                <span>{stat.change}% vs last week</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeeklyStatsCards;
