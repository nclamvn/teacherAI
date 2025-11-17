import { useMemo } from 'react';
import Icon from '../ui/Icon';
import { useLesson } from '../../contexts/LessonContext';
import { useStudio } from '../../contexts/StudioContext';
import './TimelinePanel.css';

const WORD_BANK_PREVIEW = [
  { english: "grilled", vietnamese: "nướng" },
  { english: "steamed", vietnamese: "hấp" },
  { english: "vinaigrette", vietnamese: "sốt dầu giấm" },
  { english: "on the side", vietnamese: "để riêng" },
  { english: "excellent choice", vietnamese: "lựa chọn tuyệt vời" }
];

const TimelinePanel = () => {
  const { currentLesson, currentStepIndex, progress, isLoading } = useLesson();
  const { speakingTopic, activeTab } = useStudio();

  // Determine if speaking lab has been started
  const speakingStarted = useMemo(() => {
    return speakingTopic !== null || activeTab === 'speaking';
  }, [speakingTopic, activeTab]);

  // Calculate timeline steps dynamically
  const timelineSteps = useMemo(() => {
    if (!currentLesson) {
      return [
        { id: 1, title: "Warm-up & Dialogue", duration: "5 min", status: "upcoming", icon: "sun" },
        { id: 2, title: "Practice", duration: "10 min", status: "upcoming", icon: "book" },
        { id: 3, title: "Speaking Lab", duration: "10 min", status: "upcoming", icon: "mic" },
        { id: 4, title: "Review Tomorrow", duration: "5 min", status: "upcoming", icon: "check" }
      ];
    }

    const steps = [];

    // Step 1: Warm-up & Dialogue (steps 0-1 in lesson)
    let step1Status = "upcoming";
    if (currentStepIndex > 1) step1Status = "completed";
    else if (currentStepIndex >= 0 && currentStepIndex <= 1) step1Status = "current";
    steps.push({ id: 1, title: "Warm-up & Dialogue", duration: "5 min", status: step1Status, icon: "sun" });

    // Step 2: Practice (steps 2-3 in lesson: MCQ, Build Sentence)
    let step2Status = "upcoming";
    if (currentStepIndex > 3) step2Status = "completed";
    else if (currentStepIndex >= 2 && currentStepIndex <= 3) step2Status = "current";
    steps.push({ id: 2, title: "Practice", duration: "10 min", status: step2Status, icon: "book" });

    // Step 3: Speaking Lab (step 4 in lesson OR if speaking lab was opened)
    let step3Status = "upcoming";
    if (speakingStarted) step3Status = "completed";
    else if (currentStepIndex === 4) step3Status = "current";
    steps.push({ id: 3, title: "Speaking Lab", duration: "10 min", status: step3Status, icon: "mic" });

    // Step 4: Review Tomorrow (always upcoming)
    steps.push({ id: 4, title: "Review Tomorrow", duration: "5 min", status: "upcoming", icon: "check" });

    return steps;
  }, [currentLesson, currentStepIndex, speakingStarted]);

  // Get current step progress percentage
  const getCurrentProgress = () => {
    if (!currentLesson) return 0;
    return Math.round(progress);
  };

  return (
    <div className="timeline-panel glass">
      {/* Today's Plan */}
      <div className="timeline-section">
        <h3 className="timeline-header">
          <span className="timeline-icon">
            <Icon name="listChecks" size="lg" />
          </span>
          Today's Plan
        </h3>

        <div className="timeline-track">
          {timelineSteps.map((step, index) => (
            <div
              key={step.id}
              className={`timeline-step ${step.status}`}
            >
              <div className="step-indicator">
                <div className="step-dot">
                  {step.status === 'completed' && <Icon name="checkCircle" size="base" />}
                  {step.status === 'current' && <Icon name="dot" size="base" className="pulse-dot" />}
                  {step.status === 'upcoming' && <Icon name="circle" size="base" />}
                </div>
                {index < timelineSteps.length - 1 && <div className="step-line" />}
              </div>

              <div className="step-content">
                <div className="step-header">
                  <span className="step-icon">
                    <Icon name={step.icon} size="base" />
                  </span>
                  <div className="step-info">
                    <div className="step-title">{step.title}</div>
                    <div className="step-duration">{step.duration}</div>
                  </div>
                </div>

                {step.status === 'current' && currentLesson && (
                  <div className="step-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${getCurrentProgress()}%` }} />
                    </div>
                    <span className="progress-text">{getCurrentProgress()}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Word Bank Preview */}
      <div className="word-bank-section">
        <h3 className="timeline-header">
          <span className="timeline-icon">
            <Icon name="sparkles" size="lg" />
          </span>
          Word Bank
        </h3>

        <div className="word-list">
          {WORD_BANK_PREVIEW.map((word, index) => (
            <div key={index} className="word-item glass-hover">
              <div className="word-english">{word.english}</div>
              <div className="word-vietnamese">{word.vietnamese}</div>
            </div>
          ))}
        </div>

        <button className="view-all-button">
          View All Words →
        </button>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-section">
        <div className="quick-stat">
          <div className="quick-stat-value">23</div>
          <div className="quick-stat-label">Words Learned</div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-value">4.5</div>
          <div className="quick-stat-label">Hours This Week</div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePanel;
