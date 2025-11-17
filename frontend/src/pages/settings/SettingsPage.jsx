import { useState, useEffect } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useUserProgress } from '../../contexts/UserProgressContext';
import { useNavigate } from 'react-router-dom';
import { getWeeklyGoal, updateWeeklyGoal } from '../../services/userDataService';
import Icon from '../../components/ui/Icon';
import coachesSeed from '../../sampleData/coaches_seed.json';
import './SettingsPage.css';

const SettingsPage = () => {
  const { profile, updateProfile } = useProfile();
  const { settings, updateThreshold } = useUserProgress();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    learning_style: '',
    coach_id: '',
    study_schedule: {
      days: [],
      time: '21:00',
      duration_minutes: 10
    }
  });

  const [pronunciationThreshold, setPronunciationThreshold] = useState(85);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(15);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        learning_style: profile.learning_style || '',
        coach_id: profile.coach_id || '',
        study_schedule: {
          days: profile.study_schedule?.days || [],
          time: profile.study_schedule?.time || '21:00',
          duration_minutes: profile.study_schedule?.duration_minutes || 10
        }
      });

      // Load weekly goal
      const userId = profile.id || 'default_user';
      setWeeklyGoalMinutes(getWeeklyGoal(userId));
    }
  }, [profile]);

  // Load pronunciation threshold from settings
  useEffect(() => {
    if (settings) {
      setPronunciationThreshold(settings.pronunciationThreshold || 85);
    }
  }, [settings]);

  const learningStyles = [
    {
      id: 'quick_practical',
      title: 'Quick & Practical',
      description: 'Focus on conversations you can use right away.',
      icon: 'zap'
    },
    {
      id: 'structured_grammar',
      title: 'Structured & Grammar',
      description: 'Learn with detailed explanations and foundations.',
      icon: 'bookOpen'
    },
    {
      id: 'speaking_focused',
      title: 'Speaking-focused',
      description: 'Lots of speaking practice, less theory.',
      icon: 'mic'
    }
  ];

  const daysOfWeek = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' }
  ];

  const durations = [
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' }
  ];

  const handleStyleChange = (styleId) => {
    setFormData(prev => ({ ...prev, learning_style: styleId }));
  };

  const handleCoachChange = (coachId) => {
    setFormData(prev => ({ ...prev, coach_id: coachId }));
  };

  const toggleDay = (dayId) => {
    setFormData(prev => ({
      ...prev,
      study_schedule: {
        ...prev.study_schedule,
        days: prev.study_schedule.days.includes(dayId)
          ? prev.study_schedule.days.filter(d => d !== dayId)
          : [...prev.study_schedule.days, dayId]
      }
    }));
  };

  const handleTimeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      study_schedule: {
        ...prev.study_schedule,
        time: e.target.value
      }
    }));
  };

  const handleDurationChange = (duration) => {
    setFormData(prev => ({
      ...prev,
      study_schedule: {
        ...prev.study_schedule,
        duration_minutes: duration
      }
    }));
  };

  const handleThresholdChange = (threshold) => {
    setPronunciationThreshold(threshold);
  };

  const handleWeeklyGoalChange = (minutes) => {
    setWeeklyGoalMinutes(minutes);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save profile settings
      await updateProfile(formData);

      // Save pronunciation threshold
      if (pronunciationThreshold !== settings.pronunciationThreshold) {
        updateThreshold(pronunciationThreshold);
      }

      // Save weekly goal
      const userId = profile?.id || 'default_user';
      const currentGoal = getWeeklyGoal(userId);
      if (weeklyGoalMinutes !== currentGoal) {
        updateWeeklyGoal(userId, weeklyGoalMinutes);
      }

      setSaveSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!profile) return false;
    const thresholdChanged = pronunciationThreshold !== (settings?.pronunciationThreshold || 85);
    const userId = profile?.id || 'default_user';
    const goalChanged = weeklyGoalMinutes !== getWeeklyGoal(userId);
    return (
      formData.learning_style !== profile.learning_style ||
      formData.coach_id !== profile.coach_id ||
      JSON.stringify(formData.study_schedule) !== JSON.stringify(profile.study_schedule) ||
      thresholdChanged ||
      goalChanged
    );
  };

  if (!profile) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <button className="btn-back" onClick={() => navigate('/studio')}>
          <Icon name="arrowLeft" size="base" />
          Back to Studio
        </button>
        <div className="settings-title-section">
          <h1 className="settings-title">Study Profile</h1>
          <p className="settings-subtitle">Customize your learning experience</p>
        </div>
      </div>

      <div className="settings-content">
        {/* Study Style Card */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Icon name="brain" size="lg" />
            <h2 className="settings-card-title">Learning Style</h2>
          </div>
          <div className="style-options">
            {learningStyles.map(style => (
              <button
                key={style.id}
                className={`style-option ${formData.learning_style === style.id ? 'selected' : ''}`}
                onClick={() => handleStyleChange(style.id)}
              >
                <div className="style-option-icon">
                  <Icon name={style.icon} size="xl" />
                </div>
                <div className="style-option-content">
                  <div className="style-option-title">{style.title}</div>
                  <div className="style-option-description">{style.description}</div>
                </div>
                <div className="style-option-indicator">
                  {formData.learning_style === style.id && (
                    <Icon name="checkCircle" size="base" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coach Card */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Icon name="headphones" size="lg" />
            <h2 className="settings-card-title">Your Coach</h2>
          </div>
          <div className="coach-options">
            {coachesSeed.coaches.map(coach => (
              <button
                key={coach.coach_id}
                className={`coach-option ${formData.coach_id === coach.coach_id ? 'selected' : ''}`}
                onClick={() => handleCoachChange(coach.coach_id)}
              >
                <div className="coach-option-content">
                  <div className="coach-option-name">{coach.name}</div>
                  <div className="coach-option-tagline">{coach.tagline_en}</div>
                </div>
                <div className="coach-option-indicator">
                  {formData.coach_id === coach.coach_id && (
                    <Icon name="checkCircle" size="base" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Card */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Icon name="clock" size="lg" />
            <h2 className="settings-card-title">Study Schedule</h2>
          </div>

          <div className="schedule-settings">
            {/* Days */}
            <div className="schedule-setting-group">
              <h3 className="schedule-setting-label">Which days?</h3>
              <div className="days-grid-settings">
                {daysOfWeek.map(day => (
                  <button
                    key={day.id}
                    className={`day-button-settings ${formData.study_schedule.days.includes(day.id) ? 'selected' : ''}`}
                    onClick={() => toggleDay(day.id)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="schedule-setting-group">
              <h3 className="schedule-setting-label">What time?</h3>
              <div className="time-picker-settings">
                <Icon name="clock" size="base" />
                <input
                  type="time"
                  className="time-input-settings"
                  value={formData.study_schedule.time}
                  onChange={handleTimeChange}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="schedule-setting-group">
              <h3 className="schedule-setting-label">How long?</h3>
              <div className="duration-options-settings">
                {durations.map(duration => (
                  <button
                    key={duration.value}
                    className={`duration-button-settings ${formData.study_schedule.duration_minutes === duration.value ? 'selected' : ''}`}
                    onClick={() => handleDurationChange(duration.value)}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pronunciation Settings Card */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Icon name="mic" size="lg" />
            <h2 className="settings-card-title">Pronunciation Settings</h2>
          </div>

          <div className="pronunciation-settings">
            <div className="pronunciation-setting-group">
              <h3 className="pronunciation-setting-label">
                Weak Word Threshold
              </h3>
              <p className="pronunciation-setting-description">
                Words with scores below this threshold will be saved as "weak words" for practice
              </p>
              <div className="threshold-options">
                {[80, 85, 90].map((threshold) => (
                  <button
                    key={threshold}
                    className={`threshold-button ${pronunciationThreshold === threshold ? 'selected' : ''}`}
                    onClick={() => handleThresholdChange(threshold)}
                  >
                    <span className="threshold-value">{threshold}%</span>
                    <span className="threshold-label">
                      {threshold === 80 && 'Relaxed'}
                      {threshold === 85 && 'Balanced'}
                      {threshold === 90 && 'Strict'}
                    </span>
                    {pronunciationThreshold === threshold && (
                      <Icon name="checkCircle" size="sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="settings-card glass">
          <div className="settings-card-header">
            <Icon name="target" size="lg" />
            <h2 className="settings-card-title">Weekly Speaking Goal</h2>
          </div>

          <div className="weekly-goal-settings">
            <div className="weekly-goal-setting-group">
              <h3 className="weekly-goal-setting-label">
                Daily Speaking Target
              </h3>
              <p className="weekly-goal-setting-description">
                Set your daily speaking practice goal to stay on track
              </p>
              <div className="goal-options">
                {[10, 15, 20, 30].map((minutes) => (
                  <button
                    key={minutes}
                    className={`goal-button ${weeklyGoalMinutes === minutes ? 'selected' : ''}`}
                    onClick={() => handleWeeklyGoalChange(minutes)}
                  >
                    <span className="goal-value">{minutes} min</span>
                    <span className="goal-label">/ day</span>
                    <span className="goal-total">({minutes * 7} min/week)</span>
                    {weeklyGoalMinutes === minutes && (
                      <Icon name="checkCircle" size="sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          {saveSuccess && (
            <div className="save-success">
              <Icon name="checkCircle" size="base" />
              <span>Settings saved successfully!</span>
            </div>
          )}
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!hasChanges() || isSaving}
          >
            <Icon name="check" size="base" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
