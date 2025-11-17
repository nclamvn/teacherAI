import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import AvatarContainer from '../../components/Avatar/AvatarContainer';
import coachesSeed from '../../sampleData/coaches_seed.json';
import './OnboardingSteps.css';

const Step2ChooseCoach = ({ selectedCoach, onSelect, onBack }) => {
  const [playingVoice, setPlayingVoice] = useState(null);
  const coaches = coachesSeed.coaches;

  const handleVoicePreview = (coachId, e) => {
    e.stopPropagation(); // Prevent card selection when clicking voice preview

    // Placeholder for actual TTS preview
    console.log('Playing voice preview for:', coachId);
    setPlayingVoice(coachId);

    // Simulate audio playback
    setTimeout(() => {
      setPlayingVoice(null);
    }, 2000);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">Choose Your Coach</h2>
      <p className="step-subtitle">Chọn huấn luyện viên của bạn</p>

      <div className="coach-cards">
        {coaches.map(coach => (
          <div
            key={coach.coach_id}
            className={`coach-card glass ${selectedCoach === coach.coach_id ? 'selected' : ''}`}
            onClick={() => onSelect(coach.coach_id)}
          >
            <div className="coach-avatar-wrapper">
              <AvatarContainer
                externalState={{
                  emotion: 'smiling',
                  animationState: 'idle',
                  variant: coach.avatar_variant
                }}
                showDebugLabel={false}
                autoReset={false}
              />
            </div>

            <h3 className="coach-name">{coach.name}</h3>
            <p className="coach-tagline">{coach.tagline_en}</p>
            <p className="coach-tagline-vi">{coach.tagline_vi}</p>

            <button
              className="voice-preview-button"
              onClick={(e) => handleVoicePreview(coach.coach_id, e)}
            >
              <Icon
                name={playingVoice === coach.coach_id ? 'volume-2' : 'play'}
                size="sm"
              />
              {playingVoice === coach.coach_id ? 'Playing...' : 'Preview Voice'}
            </button>
          </div>
        ))}
      </div>

      <div className="step-navigation">
        <button className="nav-button nav-button-back" onClick={onBack}>
          <Icon name="arrow-left" size="sm" />
          Back
        </button>
      </div>
    </div>
  );
};

export default Step2ChooseCoach;
