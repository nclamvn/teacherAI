import { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import './LiveTalk.css';

const ChatBubbles = ({ messages }) => {
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="chat-bubbles empty">
        <div className="empty-chat-state">
          <p className="empty-chat-title">Start a conversation!</p>
          <p className="empty-chat-subtitle">
            Press the mic button below and start speaking in English.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-bubbles">
      {messages.map((message, index) => (
        <ChatBubble key={index} message={message} />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBubbles;
