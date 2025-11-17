import { useState, useEffect, useRef } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useStudio } from '../../contexts/StudioContext';
import { useAvatarState } from '../../hooks/useAvatarState';
import LiveTalkHeader from './LiveTalkHeader';
import ChatBubbles from './ChatBubbles';
import MicButton from './MicButton';
import TopicChips from './TopicChips';
import MissionBanner from './MissionBanner';
import SessionSummaryModal from './SessionSummaryModal';
import CoachPanel from '../CoachPanel/CoachPanel';
import './LiveTalk.css';

const LiveTalkContainer = () => {
  const { profile } = useProfile();
  const { liveTalkWord, clearLiveTalkWord } = useStudio();
  const avatarControl = useAvatarState();

  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('daily_life');
  const [sessionStats, setSessionStats] = useState({
    turn_count: 0,
    word_count: 0,
    duration_minutes: 0
  });
  const [sessionSummary, setSessionSummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const sessionStartRef = useRef(Date.now());

  // Calculate session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = Math.floor((Date.now() - sessionStartRef.current) / 60000);
      setSessionStats(prev => ({ ...prev, duration_minutes: minutes }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      avatarControl.startListening();
    } catch (error) {
      console.error('Recording failed:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSendAudio = async (audioBlob) => {
    setIsProcessing(true);
    avatarControl.startThinking();

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('user_id', profile?.user_id || 'user_001');
      formData.append('coach_id', profile?.coach_id || 'ivy');
      formData.append('topic', selectedTopic);
      formData.append('history', JSON.stringify(messages));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/live-talk/turn`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();

      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: data.user_text
      }]);

      // Add assistant message with slight delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.assistant_text,
          audio_url: data.audio_url
        }]);

        // Update stats
        setSessionStats(data.session_stats);

        // Play TTS
        playAssistantAudio(data.audio_url);
      }, 500);

    } catch (error) {
      console.error('Failed to process audio:', error);
      alert('Failed to process your message. Please try again.');
      avatarControl.resetToIdle();
    } finally {
      setIsProcessing(false);
    }
  };

  const playAssistantAudio = async (audioUrl) => {
    try {
      avatarControl.startSpeaking();
      const fullUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `${import.meta.env.VITE_API_BASE_URL}${audioUrl}`;

      const audio = new Audio(fullUrl);
      audio.onended = () => avatarControl.resetToIdle();
      audio.onerror = () => {
        console.error('Failed to play audio');
        avatarControl.resetToIdle();
      };
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      avatarControl.resetToIdle();
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear conversation history?')) {
      setMessages([]);
      setSessionStats({
        turn_count: 0,
        word_count: 0,
        duration_minutes: 0
      });
      sessionStartRef.current = Date.now();
    }
  };

  const handleEndSession = async () => {
    if (messages.length === 0) {
      alert('No conversation to summarize yet. Start chatting first!');
      return;
    }

    try {
      avatarControl.startThinking();

      const formData = new FormData();
      formData.append('history', JSON.stringify(messages));
      formData.append('topic', selectedTopic);
      formData.append('user_id', profile?.user_id || 'user_001');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/live-talk/end-session`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const summary = await response.json();

      // Calculate actual duration
      const minutes = Math.floor((Date.now() - sessionStartRef.current) / 60000);
      summary.duration_minutes = minutes;

      setSessionSummary(summary);
      setShowSummaryModal(true);
      avatarControl.celebrate();

      // Reset to idle after celebration
      setTimeout(() => {
        avatarControl.resetToIdle();
      }, 2000);

    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate session summary. Please try again.');
      avatarControl.resetToIdle();
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div className="live-talk-layout">
      {/* Left: Avatar Panel */}
      <aside className="live-talk-avatar-panel">
        <CoachPanel
          avatarState={avatarControl.state}
          onAvatarStateChange={avatarControl}
        />
      </aside>

      {/* Right: Chat Interface */}
      <div className="live-talk-main">
        <LiveTalkHeader
          coachName={profile?.coach_id === 'leo' ? 'Leo' : 'Ivy'}
          onClearChat={handleClearChat}
          onEndSession={handleEndSession}
          sessionStats={sessionStats}
          hasMessages={messages.length > 0}
        />

        <TopicChips
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />

        <MissionBanner
          topic={selectedTopic}
          focusWord={liveTalkWord}
          onClearFocus={clearLiveTalkWord}
        />

        <ChatBubbles messages={messages} />

        <div className="live-talk-footer">
          <MicButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onClick={handleToggleRecording}
          />

          <div className="session-stats-mini">
            {sessionStats.turn_count} turns · {sessionStats.duration_minutes} min · {sessionStats.word_count} words
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummaryModal && (
        <SessionSummaryModal
          summary={sessionSummary}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
};

export default LiveTalkContainer;
