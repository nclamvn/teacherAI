import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import './OnboardingSteps.css';

const Step3Schedule = ({ schedule, onUpdate, onBack }) => {
  const [localSchedule, setLocalSchedule] = useState({
    days: schedule?.days || [],
    time: schedule?.time || '21:00',
    duration_minutes: schedule?.duration_minutes || 10
  });

  const daysOfWeek = [
    { id: 'mon', label: 'Mon', labelVi: 'T2' },
    { id: 'tue', label: 'Tue', labelVi: 'T3' },
    { id: 'wed', label: 'Wed', labelVi: 'T4' },
    { id: 'thu', label: 'Thu', labelVi: 'T5' },
    { id: 'fri', label: 'Fri', labelVi: 'T6' },
    { id: 'sat', label: 'Sat', labelVi: 'T7' },
    { id: 'sun', label: 'Sun', labelVi: 'CN' }
  ];

  const durations = [
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' }
  ];

  const toggleDay = (dayId) => {
    setLocalSchedule(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

  const handleTimeChange = (e) => {
    setLocalSchedule(prev => ({
      ...prev,
      time: e.target.value
    }));
  };

  const handleDurationChange = (duration) => {
    setLocalSchedule(prev => ({
      ...prev,
      duration_minutes: duration
    }));
  };

  const handleNext = () => {
    onUpdate(localSchedule);
  };

  const isValid = localSchedule.days.length > 0;

  return (
    <div className="step-container">
      <h2 className="step-title">Set Your Study Schedule</h2>
      <p className="step-subtitle">Đặt lịch học của bạn</p>

      <div className="schedule-container">
        {/* Days Selection */}
        <div className="schedule-section">
          <h3 className="schedule-section-title">Which days? / Những ngày nào?</h3>
          <div className="days-grid">
            {daysOfWeek.map(day => (
              <button
                key={day.id}
                className={`day-button ${localSchedule.days.includes(day.id) ? 'selected' : ''}`}
                onClick={() => toggleDay(day.id)}
              >
                <div>{day.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{day.labelVi}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="schedule-section">
          <h3 className="schedule-section-title">What time? / Mấy giờ?</h3>
          <div className="time-picker">
            <Icon name="clock" size="base" style={{ color: 'var(--color-accent-primary)' }} />
            <input
              type="time"
              className="time-input"
              value={localSchedule.time}
              onChange={handleTimeChange}
            />
          </div>
        </div>

        {/* Duration Selection */}
        <div className="schedule-section">
          <h3 className="schedule-section-title">How long? / Học bao lâu?</h3>
          <div className="duration-options">
            {durations.map(duration => (
              <button
                key={duration.value}
                className={`duration-button ${localSchedule.duration_minutes === duration.value ? 'selected' : ''}`}
                onClick={() => handleDurationChange(duration.value)}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="step-navigation">
        <button className="nav-button nav-button-back" onClick={onBack}>
          <Icon name="arrow-left" size="sm" />
          Back
        </button>
        <button
          className="nav-button nav-button-next"
          onClick={handleNext}
          disabled={!isValid}
        >
          Next
          <Icon name="arrow-right" size="sm" />
        </button>
      </div>
    </div>
  );
};

export default Step3Schedule;
