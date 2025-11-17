import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import { getWeeklyInsights, getWeekRange } from '../../services/userDataService';
import Icon from '../../components/ui/Icon';
import WeeklyStatsCards from './WeeklyStatsCards';
import ActivityChart from './ActivityChart';
import InsightsPanel from './InsightsPanel';
import WeeklyGoals from './WeeklyGoals';
import './ProgressPage.css';

const ProgressPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userId = profile?.id || 'default_user';

  const [weeklyData, setWeeklyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, [userId]);

  const loadWeeklyData = () => {
    setIsLoading(true);
    try {
      const data = getWeeklyInsights(userId);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWeekRange = () => {
    const { startDate, endDate } = getWeekRange(0);
    const options = { month: 'short', day: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <div className="progress-page">
        <div className="loading-state">
          <Icon name="loader" size="2xl" />
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!weeklyData) {
    return (
      <div className="progress-page">
        <div className="error-state">
          <Icon name="alertCircle" size="2xl" />
          <p>Unable to load progress data</p>
          <button className="btn-secondary" onClick={loadWeeklyData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      {/* Header */}
      <div className="progress-header">
        <button className="btn-back" onClick={() => navigate('/home')}>
          <Icon name="arrowLeft" size="base" />
          Back to Home
        </button>

        <div className="progress-header-content">
          <h1 className="progress-page-title">Your Weekly Progress</h1>
          <p className="progress-page-subtitle">{formatWeekRange()}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="progress-content">
        {/* Weekly Goals Section */}
        <section className="progress-section">
          <WeeklyGoals
            goalProgress={weeklyData.goalProgress}
            onGoalUpdate={loadWeeklyData}
          />
        </section>

        {/* Weekly Stats Cards */}
        <section className="progress-section">
          <div className="section-header-inline">
            <h2 className="section-title-sm">This Week's Stats</h2>
          </div>
          <WeeklyStatsCards
            thisWeek={weeklyData.thisWeek}
            lastWeek={weeklyData.lastWeek}
          />
        </section>

        {/* Activity Chart */}
        <section className="progress-section">
          <div className="section-header-inline">
            <h2 className="section-title-sm">Daily Activity</h2>
          </div>
          <ActivityChart dailyActivity={weeklyData.thisWeek.dailyActivity} />
        </section>

        {/* Insights Panel */}
        {weeklyData.insights && weeklyData.insights.length > 0 && (
          <section className="progress-section">
            <div className="section-header-inline">
              <h2 className="section-title-sm">Insights & Achievements</h2>
            </div>
            <InsightsPanel insights={weeklyData.insights} />
          </section>
        )}

        {/* Last Week Comparison (Collapsible) */}
        <section className="progress-section">
          <details className="comparison-details">
            <summary className="comparison-summary">
              <Icon name="barChart" size="sm" />
              <span>Compare with Last Week</span>
              <Icon name="chevronDown" size="sm" className="chevron" />
            </summary>
            <div className="comparison-content">
              <div className="comparison-grid">
                <div className="comparison-col">
                  <h4 className="comparison-label">Last Week</h4>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="stat-label">Speaking Time</span>
                      <span className="stat-value">{weeklyData.lastWeek.speakingMinutes} min</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Words Mastered</span>
                      <span className="stat-value">{weeklyData.lastWeek.wordsMastered}</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Phrases Saved</span>
                      <span className="stat-value">{weeklyData.lastWeek.phrasesSaved}</span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Avg Score</span>
                      <span className="stat-value">{weeklyData.lastWeek.avgScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="comparison-divider"></div>

                <div className="comparison-col">
                  <h4 className="comparison-label">This Week</h4>
                  <div className="comparison-stats">
                    <div className="comparison-stat">
                      <span className="stat-label">Speaking Time</span>
                      <span className="stat-value highlighted">
                        {weeklyData.thisWeek.speakingMinutes} min
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Words Mastered</span>
                      <span className="stat-value highlighted">
                        {weeklyData.thisWeek.wordsMastered}
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Phrases Saved</span>
                      <span className="stat-value highlighted">
                        {weeklyData.thisWeek.phrasesSaved}
                      </span>
                    </div>
                    <div className="comparison-stat">
                      <span className="stat-label">Avg Score</span>
                      <span className="stat-value highlighted">
                        {weeklyData.thisWeek.avgScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* Quick Actions */}
        <section className="progress-section">
          <div className="quick-actions">
            <button
              className="action-btn"
              onClick={() => navigate('/studio')}
            >
              <Icon name="target" size="base" />
              <span>Continue Practice</span>
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/settings')}
            >
              <Icon name="settings" size="base" />
              <span>Adjust Goals</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProgressPage;
