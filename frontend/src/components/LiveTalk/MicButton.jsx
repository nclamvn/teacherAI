import Icon from '../ui/Icon';
import './LiveTalk.css';

const MicButton = ({ isRecording, isProcessing, onClick }) => {
  const getButtonState = () => {
    if (isProcessing) return 'processing';
    if (isRecording) return 'recording';
    return 'idle';
  };

  const state = getButtonState();

  return (
    <button
      className={`mic-button ${state}`}
      onClick={onClick}
      disabled={isProcessing}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isProcessing ? (
        <Icon name="loader" size="xl" className="spinning" />
      ) : (
        <Icon name="mic" size="xl" />
      )}
    </button>
  );
};

export default MicButton;
