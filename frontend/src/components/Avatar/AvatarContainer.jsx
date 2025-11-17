import { useEffect, useState } from 'react';
import { useAvatarState, AVATAR_STATES } from '../../hooks/useAvatarState';
import { useProfile } from '../../contexts/ProfileContext';
import { TeacherAvatarCanvas } from '../Avatar3D/TeacherAvatarCanvas';
import './avatarAnimations.css';

const AvatarContainer = ({
  onStateChange,
  autoReset = true,
  showDebugLabel = false,
  externalState = null,
  onExternalStateChange = null
}) => {
  const { profile } = useProfile();
  const internalAvatar = useAvatarState();

  // Use external state if provided, otherwise use internal
  const avatarControl = externalState ? {
    state: externalState,
    ...onExternalStateChange
  } : internalAvatar;

  const { state } = avatarControl;
  const [showParticles, setShowParticles] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  const [showThinkingDots, setShowThinkingDots] = useState(false);

  // Get coach ID from profile (default to 'ivy' if not set)
  const coachId = profile?.coach_id || 'ivy';

  // Auto-reset to idle after celebrating
  useEffect(() => {
    if (state === AVATAR_STATES.CELEBRATING && autoReset && avatarControl.resetToIdle) {
      const timer = setTimeout(() => {
        avatarControl.resetToIdle();
        setShowParticles(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, autoReset, avatarControl]);

  // Show/hide state-specific elements
  useEffect(() => {
    setShowParticles(state === AVATAR_STATES.CELEBRATING);
    setShowWaveform(state === AVATAR_STATES.LISTENING);
    setShowThinkingDots(state === AVATAR_STATES.THINKING);
  }, [state]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  // Generate celebration particles
  const renderParticles = () => {
    return Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="particle" />
    ));
  };

  // Generate waveform bars
  const renderWaveform = () => {
    return (
      <div className="avatar-waveform">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="wave-bar" />
        ))}
      </div>
    );
  };

  // Generate thinking dots
  const renderThinkingDots = () => {
    return (
      <div className="thinking-dots">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="thinking-dot" />
        ))}
      </div>
    );
  };

  return (
    <div className={`avatar-wrapper ${state}`}>
      {/* 3D Avatar Canvas */}
      <div className="avatar-3d-container" data-state={state}>
        <TeacherAvatarCanvas
          avatarState={state}
          coachId={coachId}
        />
      </div>

      {/* State-specific elements */}
      {showWaveform && renderWaveform()}
      {showThinkingDots && renderThinkingDots()}
      {showParticles && (
        <div className="celebration-particles">
          {renderParticles()}
        </div>
      )}

      {/* Debug label */}
      {showDebugLabel && (
        <div className="avatar-state-label">
          {state}
        </div>
      )}
    </div>
  );
};

// Export both the component and the hook
export default AvatarContainer;
export { useAvatarState };
