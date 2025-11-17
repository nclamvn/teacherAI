import { useEffect, useState } from 'react';
import Icon from '../../ui/Icon';
import { useLesson } from '../../../contexts/LessonContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { useUserProgress } from '../../../contexts/UserProgressContext';
import { speakText } from '../../../utils/ttsHelper';
import './StepStyles.css';

const DialogueStep = ({ step, index }) => {
  const { recordStepResult } = useLesson();
  const { profile } = useProfile();
  const { addSavedPhrase } = useUserProgress();
  const [playingLineIndex, setPlayingLineIndex] = useState(null);
  const [savedLines, setSavedLines] = useState(new Set());

  // Auto-mark as completed when user views this step
  useEffect(() => {
    recordStepResult(index, { completed: true });
  }, [index, recordStepResult]);

  const handlePlayLine = async (lineIndex, text) => {
    if (playingLineIndex === lineIndex) return;

    setPlayingLineIndex(lineIndex);
    await speakText(text, 'en', profile?.coach_id || 'ivy');
    setPlayingLineIndex(null);
  };

  const handleSavePhrase = (lineIndex, line) => {
    const success = addSavedPhrase({
      text_en: line.text,
      text_vi: line.vietnamese || null,
      source: 'lesson',
      topic: step.topic || 'conversation',
      coach_id: profile?.coach_id || null
    });

    if (success) {
      setSavedLines(prev => new Set([...prev, lineIndex]));
      // Optional: Show a quick toast/feedback
    }
  };

  return (
    <div className="lesson-card glass">
      <div className="step-tag dialogue">
        <Icon name="messageSquare" size="base" />
        Conversation
      </div>

      <div className="dialogue-list">
        {step.lines.map((line, i) => (
          <div key={i} className="dialogue-line">
            <div className="dialogue-line-content">
              <span className="speaker">{line.speaker}</span>
              <p className="text">{line.text}</p>
            </div>
            <div className="dialogue-line-actions">
              <button
                className="btn-play-line"
                onClick={() => handlePlayLine(i, line.text)}
                disabled={playingLineIndex === i}
                title="Listen"
              >
                <Icon name={playingLineIndex === i ? 'volume2' : 'play'} size="sm" />
              </button>
              <button
                className={`btn-save-phrase ${savedLines.has(i) ? 'saved' : ''}`}
                onClick={() => handleSavePhrase(i, line)}
                disabled={savedLines.has(i)}
                title={savedLines.has(i) ? 'Saved to My Phrases' : 'Save to My Phrases'}
              >
                <Icon name={savedLines.has(i) ? 'bookmark' : 'bookmark'} size="sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {step.key_phrases && step.key_phrases.length > 0 && (
        <div className="key-phrases-section">
          <h4 className="section-subtitle">
            <Icon name="highlighter" size="base" />
            Key phrases
          </h4>
          <div className="key-phrases">
            {step.key_phrases.map((kp, i) => (
              <div key={i} className="phrase-card glass-hover">
                <div className="phrase-row">
                  <p className="phrase-en">{kp.english}</p>
                  <p className="phrase-vi">{kp.vietnamese}</p>
                </div>
                {kp.example && (
                  <p className="phrase-example">
                    <Icon name="quote" size="sm" />
                    {kp.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DialogueStep;
