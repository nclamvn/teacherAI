import { useState, useRef, useEffect } from 'react';
import Icon from '../ui/Icon';
import './AudioFeedback.css';

const AudioPlayer = ({ label, tag, text, audioUrl, onAvatarStateChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (onAvatarStateChange) {
        onAvatarStateChange.resetToIdle();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onAvatarStateChange]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onAvatarStateChange) {
        onAvatarStateChange.resetToIdle();
      }
    } else {
      audio.play();
      setIsPlaying(true);
      if (onAvatarStateChange) {
        onAvatarStateChange.startSpeaking();
      }
    }
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="audio-player-header">
        <div className="audio-label">
          <Icon name="languages" size="sm" />
          <span className="audio-tag">{tag}</span>
        </div>
        <button
          className="audio-play-btn"
          onClick={togglePlay}
          disabled={!audioUrl}
        >
          {isPlaying ? <Icon name="pause" size="lg" /> : <Icon name="play" size="lg" />}
        </button>
      </div>

      <div className="audio-text">{text}</div>

      {audioUrl && (
        <div className="audio-progress-bar">
          <div
            className="audio-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

const AudioFeedback = ({
  feedbackEn,
  feedbackVi,
  ttsEnUrl,
  ttsViUrl,
  onAvatarStateChange
}) => {
  return (
    <div className="audio-feedback">
      <div className="audio-feedback-header">
        <Icon name="headphones" size="lg" />
        <span>Coach Ivy's Voice Feedback</span>
      </div>

      <div className="audio-players-grid">
        <AudioPlayer
          label="English"
          tag="EN"
          text={feedbackEn}
          audioUrl={ttsEnUrl}
          onAvatarStateChange={onAvatarStateChange}
        />
        <AudioPlayer
          label="Vietnamese"
          tag="VI"
          text={feedbackVi}
          audioUrl={ttsViUrl}
          onAvatarStateChange={onAvatarStateChange}
        />
      </div>
    </div>
  );
};

export default AudioFeedback;
