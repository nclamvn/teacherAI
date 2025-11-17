import { useEffect, useState } from 'react';
import Icon from '../../ui/Icon';
import { useLesson } from '../../../contexts/LessonContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { speakText } from '../../../utils/ttsHelper';
import './StepStyles.css';

const WarmupStep = ({ step, index }) => {
  const { recordStepResult } = useLesson();
  const { profile } = useProfile();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play when step loads
  useEffect(() => {
    if (!hasAutoPlayed && step.text && profile?.coach_id) {
      handlePlayAudio();
      setHasAutoPlayed(true);
    }
  }, [step.text, profile?.coach_id, hasAutoPlayed]);

  // Auto-mark as completed when user views this step
  useEffect(() => {
    recordStepResult(index, { completed: true });
  }, [index, recordStepResult]);

  const handlePlayAudio = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    await speakText(step.text, 'en', profile?.coach_id || 'ivy');
    setIsPlaying(false);
  };

  return (
    <div className="lesson-card glass">
      <div className="step-tag warmup">
        <Icon name="sun" size="base" />
        Warm-up
      </div>

      <div className="warmup-content">
        <p className="warmup-text-en">"{step.text}"</p>
        {step.translation_vi && (
          <p className="warmup-text-vi">{step.translation_vi}</p>
        )}
      </div>

      <div className="warmup-actions">
        <button
          className="btn-secondary"
          onClick={handlePlayAudio}
          disabled={isPlaying}
        >
          <Icon name={isPlaying ? 'volume2' : 'play'} size="base" />
          {isPlaying ? 'Playing...' : 'Replay'}
        </button>
        <button className="btn-ghost">
          <Icon name="check" size="base" />
          I'm ready
        </button>
      </div>
    </div>
  );
};

export default WarmupStep;
