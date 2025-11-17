import { useState } from 'react';
import Icon from '../ui/Icon';
import { useProfile } from '../../contexts/ProfileContext';
import { speakText } from '../../utils/ttsHelper';
import './NavigationButtons.css';

const NavigationButtons = ({
  isFirstStep,
  isLastStep,
  onPrev,
  onNext,
  onComplete,
  avatarControl,
}) => {
  const { profile } = useProfile();
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);

  const handlePrimary = async () => {
    if (isLastStep) {
      const result = await onComplete();

      if (result?.success) {
        // Show completion banner
        setShowCompletionBanner(true);

        // Avatar celebration
        avatarControl?.celebrate();

        // TTS congratulations in English
        await speakText(
          "Congratulations! You've completed the lesson. Great work!",
          'en',
          profile?.coach_id || 'ivy'
        );

        // TTS congratulations in Vietnamese
        await speakText(
          "Chúc mừng! Bạn đã hoàn thành bài học. Làm tốt lắm!",
          'vi',
          profile?.coach_id || 'ivy'
        );

        // Reset avatar after celebration
        setTimeout(() => {
          avatarControl?.resetToIdle();
        }, 3000);

        // Hide banner after 5 seconds
        setTimeout(() => {
          setShowCompletionBanner(false);
        }, 5000);
      }
    } else {
      onNext();
    }
  };

  return (
    <>
      {showCompletionBanner && (
        <div className="completion-banner">
          <div className="completion-content">
            <Icon name="sparkles" size="xl" />
            <div className="completion-text">
              <h3>Lesson Completed! 🎉</h3>
              <p>Amazing work! You're making great progress.</p>
            </div>
          </div>
        </div>
      )}

      <div className="lesson-nav">
        <button
          className="nav-btn nav-btn-back"
          onClick={onPrev}
          disabled={isFirstStep}
        >
          <Icon name="arrowLeft" size="base" />
          Back
        </button>

        <button className="nav-btn nav-btn-primary" onClick={handlePrimary}>
          {isLastStep ? (
            <>
              <Icon name="check" size="base" />
              Finish lesson
            </>
          ) : (
            <>
              Next step
              <Icon name="arrowRight" size="base" />
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default NavigationButtons;
