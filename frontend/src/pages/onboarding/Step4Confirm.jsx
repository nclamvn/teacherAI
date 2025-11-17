import Icon from '../../components/ui/Icon';
import coachesSeed from '../../sampleData/coaches_seed.json';
import './OnboardingSteps.css';

const Step4Confirm = ({ formData, onConfirm, onBack }) => {
  // Get learning style display name
  const learningStyleLabels = {
    'quick_practical': { en: 'Quick & Practical', vi: 'Nhanh & Thực Tế' },
    'structured_grammar': { en: 'Structured & Grammar-friendly', vi: 'Có Cấu Trúc & Ngữ Pháp' },
    'speaking_focused': { en: 'Speaking-focused', vi: 'Tập Trung Nói' }
  };

  // Get coach info
  const coach = coachesSeed.coaches.find(c => c.coach_id === formData.coach_id);

  // Format days
  const dayLabels = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
  };

  const formattedDays = formData.study_schedule?.days
    ?.map(day => dayLabels[day])
    .join(', ') || 'Not set';

  const learningStyle = learningStyleLabels[formData.learning_style];

  return (
    <div className="step-container">
      <h2 className="step-title">Ready to Start!</h2>
      <p className="step-subtitle">Sẵn sàng bắt đầu!</p>

      <div className="confirm-container">
        {/* Learning Style */}
        <div className="confirm-section">
          <div className="confirm-section-title">
            <Icon name="zap" size="sm" style={{ display: 'inline', marginRight: '8px' }} />
            Learning Style
          </div>
          <div className="confirm-value">
            {learningStyle?.en || 'Not selected'}
          </div>
          <div className="confirm-value-sub">
            {learningStyle?.vi}
          </div>
        </div>

        {/* Coach */}
        <div className="confirm-section">
          <div className="confirm-section-title">
            <Icon name="user" size="sm" style={{ display: 'inline', marginRight: '8px' }} />
            Your Coach
          </div>
          <div className="confirm-value">
            {coach?.name || 'Not selected'}
          </div>
          <div className="confirm-value-sub">
            {coach?.tagline_vi}
          </div>
        </div>

        {/* Schedule */}
        <div className="confirm-section">
          <div className="confirm-section-title">
            <Icon name="calendar" size="sm" style={{ display: 'inline', marginRight: '8px' }} />
            Study Schedule
          </div>
          <div className="confirm-value">
            {formattedDays}
          </div>
          <div className="confirm-value-sub">
            {formData.study_schedule?.time} • {formData.study_schedule?.duration_minutes} minutes
          </div>
        </div>
      </div>

      <div className="step-navigation">
        <button className="nav-button nav-button-back" onClick={onBack}>
          <Icon name="arrow-left" size="sm" />
          Back
        </button>
        <button className="nav-button nav-button-confirm" onClick={onConfirm}>
          <Icon name="check" size="sm" />
          Start Learning
        </button>
      </div>
    </div>
  );
};

export default Step4Confirm;
