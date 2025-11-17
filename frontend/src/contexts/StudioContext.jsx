import { createContext, useContext, useState, useCallback } from 'react';

const StudioContext = createContext();

export const StudioProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('lesson');
  const [speakingTopic, setSpeakingTopic] = useState(null);
  const [liveTalkWord, setLiveTalkWord] = useState(null);

  const switchToSpeakingLab = useCallback((topic = null) => {
    if (topic) {
      setSpeakingTopic(topic);
    }
    setActiveTab('speaking');
  }, []);

  const switchToLesson = useCallback(() => {
    setActiveTab('lesson');
  }, []);

  const switchToLiveTalk = useCallback((word = null) => {
    if (word) {
      setLiveTalkWord(word);
    }
    setActiveTab('liveTalk');
  }, []);

  const clearSpeakingTopic = useCallback(() => {
    setSpeakingTopic(null);
  }, []);

  const clearLiveTalkWord = useCallback(() => {
    setLiveTalkWord(null);
  }, []);

  return (
    <StudioContext.Provider value={{
      activeTab,
      setActiveTab,
      speakingTopic,
      setSpeakingTopic,
      liveTalkWord,
      setLiveTalkWord,
      switchToSpeakingLab,
      switchToLesson,
      switchToLiveTalk,
      clearSpeakingTopic,
      clearLiveTalkWord
    }}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within StudioProvider');
  }
  return context;
};
