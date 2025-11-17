import { createContext, useContext, useState, useEffect } from 'react';
import {
  saveWeakWord,
  getWeakWords,
  getTopWeakWords,
  removeWeakWord,
  moveToMastered,
  getMasteredWords,
  removeMasteredWord,
  savePhrase,
  getSavedPhrases,
  removeSavedPhrase,
  updatePhraseStats,
  getTodayPhrases,
  getPhrasesByTopic,
  incrementSessionCount,
  getSessionCount,
  getUserProgress,
  clearUserData,
  getUserSettings,
  updateUserSettings,
  getPronunciationThreshold,
  updatePronunciationThreshold
} from '../services/userDataService';

const UserProgressContext = createContext();

export const UserProgressProvider = ({ children }) => {
  const [userId, setUserId] = useState('user_001'); // Mock user ID
  const [weakWords, setWeakWords] = useState([]);
  const [masteredWords, setMasteredWords] = useState([]);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [settings, setSettings] = useState({
    pronunciationThreshold: 85,
    autoSaveWeakWords: true,
    masteredWordThreshold: 90,
    masteredWordAttempts: 3
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user progress on mount
  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = () => {
    try {
      setIsLoading(true);
      const progress = getUserProgress(userId);
      const userSettings = getUserSettings(userId);
      const mastered = getMasteredWords(userId);
      setWeakWords(progress.weak_words);
      setMasteredWords(mastered);
      setSavedPhrases(progress.saved_phrases);
      setSessionCount(progress.session_count);
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== WEAK WORDS =====

  const addWeakWord = (word, errorType, errorCount = 1, extraData = {}) => {
    try {
      const weakWordData = {
        word,
        error_type: errorType,
        error_count: errorCount,
        last_practiced: new Date().toISOString(),
        ...extraData
      };

      const success = saveWeakWord(userId, weakWordData);
      if (success) {
        // Reload weak words to get updated list
        setWeakWords(getWeakWords(userId));
      }
      return success;
    } catch (error) {
      console.error('Failed to add weak word:', error);
      return false;
    }
  };

  const deleteWeakWord = (word) => {
    try {
      const success = removeWeakWord(userId, word);
      if (success) {
        setWeakWords(getWeakWords(userId));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete weak word:', error);
      return false;
    }
  };

  const getTopWeakWordsForPractice = (topN = 5) => {
    return getTopWeakWords(userId, topN);
  };

  // ===== MASTERED WORDS =====

  const markAsMastered = (weakWord) => {
    try {
      const success = moveToMastered(userId, weakWord);
      if (success) {
        // Reload both lists
        setWeakWords(getWeakWords(userId));
        setMasteredWords(getMasteredWords(userId));
      }
      return success;
    } catch (error) {
      console.error('Failed to mark word as mastered:', error);
      return false;
    }
  };

  const deleteMasteredWord = (word) => {
    try {
      const success = removeMasteredWord(userId, word);
      if (success) {
        setMasteredWords(getMasteredWords(userId));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete mastered word:', error);
      return false;
    }
  };

  // ===== SAVED PHRASES =====

  const addSavedPhrase = (phraseData) => {
    try {
      // phraseData: { text_en, text_vi?, source, topic?, coach_id? }
      const success = savePhrase(userId, phraseData);
      if (success) {
        // Reload phrases to get updated list
        setSavedPhrases(getSavedPhrases(userId));
      }
      return success;
    } catch (error) {
      console.error('Failed to add saved phrase:', error);
      return false;
    }
  };

  const deleteSavedPhrase = (phraseIdOrText) => {
    try {
      const success = removeSavedPhrase(userId, phraseIdOrText);
      if (success) {
        setSavedPhrases(getSavedPhrases(userId));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete saved phrase:', error);
      return false;
    }
  };

  const updatePhrasePractice = (phraseId, score) => {
    try {
      const masteryThreshold = settings?.pronunciationThreshold || 85;
      const requiredStreak = 3; // Could be added to settings later

      const updatedPhrase = updatePhraseStats(userId, phraseId, score, masteryThreshold, requiredStreak);
      if (updatedPhrase) {
        // Reload phrases to get updated list
        setSavedPhrases(getSavedPhrases(userId));
        return updatedPhrase;
      }
      return null;
    } catch (error) {
      console.error('Failed to update phrase practice:', error);
      return null;
    }
  };

  const getTodayPhrasesForPractice = (limit = 3) => {
    return getTodayPhrases(userId, limit);
  };

  const getPhrasesByTopicFilter = (topic) => {
    return getSavedPhrases(userId, topic);
  };

  const getPhrasesByStatus = (status) => {
    return getSavedPhrases(userId, null, status);
  };

  const getPhrasesGrouped = () => {
    return getPhrasesByTopic(userId);
  };

  // ===== SESSION TRACKING =====

  const completeSession = () => {
    try {
      const newCount = incrementSessionCount(userId);
      setSessionCount(newCount);
      return newCount;
    } catch (error) {
      console.error('Failed to complete session:', error);
      return sessionCount;
    }
  };

  // ===== DATA MANAGEMENT =====

  const resetUserData = () => {
    try {
      const success = clearUserData(userId);
      if (success) {
        setWeakWords([]);
        setMasteredWords([]);
        setSavedPhrases([]);
        setSessionCount(0);
      }
      return success;
    } catch (error) {
      console.error('Failed to reset user data:', error);
      return false;
    }
  };

  const refreshProgress = () => {
    loadUserProgress();
  };

  // ===== STATS =====

  const getProgressStats = () => {
    const totalErrors = weakWords.reduce((sum, w) => sum + w.error_count, 0);
    const phrasesByTopicCount = getPhrasesByTopic(userId);
    const topicCounts = Object.keys(phrasesByTopicCount).reduce((acc, topic) => {
      acc[topic] = phrasesByTopicCount[topic].length;
      return acc;
    }, {});

    return {
      total_weak_words: weakWords.length,
      total_errors: totalErrors,
      total_saved_phrases: savedPhrases.length,
      phrases_by_topic: topicCounts,
      session_count: sessionCount
    };
  };

  // ===== SETTINGS =====

  const updateSettings = (newSettings) => {
    try {
      const success = updateUserSettings(userId, newSettings);
      if (success) {
        const updatedSettings = getUserSettings(userId);
        setSettings(updatedSettings);
      }
      return success;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  const updateThreshold = (threshold) => {
    try {
      const success = updatePronunciationThreshold(userId, threshold);
      if (success) {
        setSettings(prev => ({ ...prev, pronunciationThreshold: threshold }));
      }
      return success;
    } catch (error) {
      console.error('Failed to update threshold:', error);
      return false;
    }
  };

  const value = {
    // State
    userId,
    weakWords,
    masteredWords,
    savedPhrases,
    sessionCount,
    settings,
    isLoading,

    // Weak words
    addWeakWord,
    deleteWeakWord,
    getTopWeakWordsForPractice,

    // Mastered words
    markAsMastered,
    deleteMasteredWord,

    // Saved phrases
    addSavedPhrase,
    deleteSavedPhrase,
    updatePhrasePractice,
    getTodayPhrasesForPractice,
    getPhrasesByTopicFilter,
    getPhrasesByStatus,
    getPhrasesGrouped,

    // Session tracking
    completeSession,

    // Settings
    updateSettings,
    updateThreshold,

    // Data management
    resetUserData,
    refreshProgress,
    getProgressStats
  };

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within UserProgressProvider');
  }
  return context;
};
