import { useState } from 'react';
import './ProgressPage.css';

const ActivityChart = ({ dailyActivity }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (!dailyActivity || dailyActivity.length === 0) {
    return (
      <div className="activity-chart-empty">
        <p>No activity data available for this week</p>
      </div>
    );
  }

  // Find max value for scaling
  const maxMinutes = Math.max(...dailyActivity.map(day => day.speakingMinutes), 15); // Min 15 for scale
  const targetMinutes = 15; // Daily goal

  return (
    <div className="activity-chart">
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color speaking"></div>
          <span>Speaking Time</span>
        </div>
        <div className="legend-item">
          <div className="legend-color target"></div>
          <span>Daily Goal (15 min)</span>
        </div>
      </div>

      <div className="chart-container">
        {/* Y-axis labels */}
        <div className="chart-y-axis">
          <span className="y-label">{maxMinutes}m</span>
          <span className="y-label">{Math.round(maxMinutes / 2)}m</span>
          <span className="y-label">0m</span>
        </div>

        {/* Chart bars */}
        <div className="chart-bars">
          {/* Target line */}
          <div
            className="target-line"
            style={{ bottom: `${(targetMinutes / maxMinutes) * 100}%` }}
          >
            <span className="target-label">Goal</span>
          </div>

          {/* Daily bars */}
          {dailyActivity.map((day, index) => {
            const heightPercentage = (day.speakingMinutes / maxMinutes) * 100;
            const metGoal = day.speakingMinutes >= targetMinutes;
            const isHovered = hoveredDay === index;

            return (
              <div
                key={index}
                className="chart-bar-wrapper"
                onMouseEnter={() => setHoveredDay(index)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="chart-bar-container">
                  <div
                    className={`chart-bar ${metGoal ? 'met-goal' : ''} ${isHovered ? 'hovered' : ''}`}
                    style={{ height: `${heightPercentage}%` }}
                  >
                    {isHovered && (
                      <div className="bar-tooltip">
                        <div className="tooltip-row">
                          <span className="tooltip-label">Speaking:</span>
                          <span className="tooltip-value">{day.speakingMinutes} min</span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">Words:</span>
                          <span className="tooltip-value">{day.wordsCount}</span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">Phrases:</span>
                          <span className="tooltip-value">{day.phrasesCount}</span>
                        </div>
                        {day.practiceCount > 0 && (
                          <div className="tooltip-row">
                            <span className="tooltip-label">Practiced:</span>
                            <span className="tooltip-value">{day.practiceCount}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="chart-bar-label">
                  {day.dayName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">
            {dailyActivity.reduce((sum, day) => sum + day.speakingMinutes, 0)} minutes
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Daily Average:</span>
          <span className="summary-value">
            {Math.round(
              dailyActivity.reduce((sum, day) => sum + day.speakingMinutes, 0) / 7
            )} minutes
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
