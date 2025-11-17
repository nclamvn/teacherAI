import { useState } from 'react';
import Icon from '../ui/Icon';
import './LiveTalk.css';

const ChatBubble = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (!message.audio_url || isPlaying) return;

    try {
      setIsPlaying(true);
      const fullUrl = message.audio_url.startsWith('http')
        ? message.audio_url
        : `${import.meta.env.VITE_API_BASE_URL}${message.audio_url}`;

      const audio = new Audio(fullUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`chat-bubble ${message.role}`}>
      <div className="bubble-content">
        <p className="bubble-text">{message.content}</p>

        {message.role === 'assistant' && message.audio_url && (
          <button
            className="bubble-play-btn"
            onClick={handlePlayAudio}
            disabled={isPlaying}
            title="Play audio"
          >
            <Icon name={isPlaying ? 'volume2' : 'volume'} size="sm" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
