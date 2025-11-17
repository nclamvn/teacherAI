/**
 * User Data Service - LocalStorage-based user progress tracking
 *
 * Manages:
 * - Weak words (pronunciation errors)
 * - Saved phrases (personal phrase bank)
 * - Session statistics
 *
 * Storage keys:
 * - weak_words_{userId}: Array of WeakWord objects
 * - saved_phrases_{userId}: Array of SavedPhrase objects
 * - session_count_{userId}: Number of completed sessions
 */

const STORAGE_KEYS = {
  weakWords: (userId) => `weak_words_${userId}`,
  masteredWords: (userId) => `mastered_words_${userId}`,
  savedPhrases: (userId) => `saved_phrases_${userId}`,
  sessionCount: (userId) => `session_count_${userId}`,
  settings: (userId) => `user_settings_${userId}`,
  weeklyGoal: (userId) => `weekly_goal_${userId}`,
  weeklyHistory: (userId) => `weekly_history_${userId}`
};

// ===== WEAK WORDS =====

/**
 * Save or update a weak word
 * @param {string} userId - User identifier
 * @param {Object} weakWord - { word, error_type, error_count, last_practiced, last_score, success_streak }
 * @returns {boolean} Success status
 */
export const saveWeakWord = (userId, weakWord) => {
  try {
    const existing = getWeakWords(userId);

    // Find if word already exists
    const existingIndex = existing.findIndex(
      (w) => w.word.toLowerCase() === weakWord.word.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing word (increment count, update timestamp, track success)
      const currentWord = existing[existingIndex];

      existing[existingIndex] = {
        ...currentWord,
        error_count: currentWord.error_count + (weakWord.error_count || 1),
        error_type: weakWord.error_type, // Update to latest error type
        last_practiced: weakWord.last_practiced || new Date().toISOString(),
        last_score: weakWord.last_score !== undefined ? weakWord.last_score : currentWord.last_score,
        success_streak: weakWord.success_streak !== undefined ? weakWord.success_streak : (currentWord.success_streak || 0)
      };
    } else {
      // Add new weak word
      existing.push({
        word: weakWord.word,
        error_type: weakWord.error_type,
        error_count: weakWord.error_count || 1,
        last_practiced: weakWord.last_practiced || new Date().toISOString(),
        last_score: weakWord.last_score || 0,
        success_streak: weakWord.success_streak || 0
      });
    }

    localStorage.setItem(STORAGE_KEYS.weakWords(userId), JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error saving weak word:', error);
    return false;
  }
};

/**
 * Get weak words for user, sorted by error count (descending)
 * @param {string} userId - User identifier
 * @param {number} limit - Maximum number to return (default: all)
 * @returns {Array} Array of weak words
 */
export const getWeakWords = (userId, limit = null) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.weakWords(userId));
    const words = stored ? JSON.parse(stored) : [];

    // Sort by error count (highest first)
    words.sort((a, b) => b.error_count - a.error_count);

    return limit ? words.slice(0, limit) : words;
  } catch (error) {
    console.error('Error getting weak words:', error);
    return [];
  }
};

/**
 * Get top N weak words for focused practice
 * @param {string} userId - User identifier
 * @param {number} topN - Number of words to return
 * @returns {Array} Top N weak words
 */
export const getTopWeakWords = (userId, topN = 5) => {
  return getWeakWords(userId, topN);
};

/**
 * Remove a weak word (when user has mastered it)
 * @param {string} userId - User identifier
 * @param {string} word - Word to remove
 * @returns {boolean} Success status
 */
export const removeWeakWord = (userId, word) => {
  try {
    const existing = getWeakWords(userId);
    const filtered = existing.filter(
      (w) => w.word.toLowerCase() !== word.toLowerCase()
    );

    localStorage.setItem(STORAGE_KEYS.weakWords(userId), JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing weak word:', error);
    return false;
  }
};

// ===== MASTERED WORDS =====

/**
 * Move a weak word to mastered words
 * @param {string} userId - User identifier
 * @param {Object} weakWord - The weak word to move
 * @returns {boolean} Success status
 */
export const moveToMastered = (userId, weakWord) => {
  try {
    const mastered = getMasteredWords(userId);
    const weakWords = getWeakWords(userId);

    // Check if already mastered
    const alreadyMastered = mastered.some(
      (w) => w.word.toLowerCase() === weakWord.word.toLowerCase()
    );

    if (alreadyMastered) {
      return false;
    }

    // Add to mastered with timestamp
    mastered.unshift({
      word: weakWord.word,
      error_type: weakWord.error_type,
      mastered_at: new Date().toISOString(),
      final_error_count: weakWord.error_count
    });

    // Remove from weak words
    const filtered = weakWords.filter(
      (w) => w.word.toLowerCase() !== weakWord.word.toLowerCase()
    );

    localStorage.setItem(STORAGE_KEYS.masteredWords(userId), JSON.stringify(mastered));
    localStorage.setItem(STORAGE_KEYS.weakWords(userId), JSON.stringify(filtered));

    return true;
  } catch (error) {
    console.error('Error moving word to mastered:', error);
    return false;
  }
};

/**
 * Get all mastered words
 * @param {string} userId - User identifier
 * @returns {Array} Array of mastered word objects
 */
export const getMasteredWords = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.masteredWords(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting mastered words:', error);
    return [];
  }
};

/**
 * Remove a mastered word
 * @param {string} userId - User identifier
 * @param {string} word - Word to remove
 * @returns {boolean} Success status
 */
export const removeMasteredWord = (userId, word) => {
  try {
    const existing = getMasteredWords(userId);
    const filtered = existing.filter(
      (w) => w.word.toLowerCase() !== word.toLowerCase()
    );

    localStorage.setItem(STORAGE_KEYS.masteredWords(userId), JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing mastered word:', error);
    return false;
  }
};

// ===== SAVED PHRASES =====

/**
 * Generate unique phrase ID
 */
const generatePhraseId = () => {
  return `phrase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save a phrase to user's personal bank
 * @param {string} userId - User identifier
 * @param {Object} phraseData - {
 *   text_en: string,
 *   text_vi?: string,
 *   source: 'lesson' | 'live_talk' | 'speaking_lab' | 'manual',
 *   topic?: string,
 *   coach_id?: 'ivy' | 'leo'
 * }
 * @returns {boolean} Success status
 */
export const savePhrase = (userId, phraseData) => {
  try {
    const existing = getSavedPhrases(userId);

    // Check if phrase already exists (by text_en)
    const isDuplicate = existing.some(
      (p) => p.text_en.toLowerCase() === phraseData.text_en.toLowerCase()
    );

    if (isDuplicate) {
      console.warn('Phrase already saved:', phraseData.text_en);
      return false; // Don't save duplicates
    }

    // Add new phrase with full structure
    const newPhrase = {
      id: generatePhraseId(),
      text_en: phraseData.text_en,
      text_vi: phraseData.text_vi || null,
      source: phraseData.source || 'manual',
      topic: phraseData.topic || null,
      coach_id: phraseData.coach_id || null,
      created_at: new Date().toISOString(),
      last_practiced_at: null,
      practice_count: 0,
      success_streak: 0,
      avg_score: 0,
      status: 'weak' // Start as weak, progress to learning -> mastered
    };

    existing.unshift(newPhrase);

    localStorage.setItem(STORAGE_KEYS.savedPhrases(userId), JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error saving phrase:', error);
    return false;
  }
};

/**
 * Get saved phrases, optionally filtered by topic or status
 * @param {string} userId - User identifier
 * @param {string} topic - Optional topic filter (food, travel, work, hobbies)
 * @param {string} status - Optional status filter ('weak', 'learning', 'mastered')
 * @returns {Array} Array of saved phrases
 */
export const getSavedPhrases = (userId, topic = null, status = null) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.savedPhrases(userId));
    let phrases = stored ? JSON.parse(stored) : [];

    // Migrate old format if needed (backward compatibility)
    phrases = phrases.map(p => {
      if (p.phrase && !p.text_en) {
        return {
          id: generatePhraseId(),
          text_en: p.phrase,
          text_vi: null,
          source: p.source || 'manual',
          topic: p.topic || null,
          coach_id: null,
          created_at: p.saved_at || new Date().toISOString(),
          last_practiced_at: null,
          practice_count: 0,
          success_streak: 0,
          avg_score: 0,
          status: 'weak'
        };
      }
      return p;
    });

    // Filter by topic if provided
    if (topic) {
      phrases = phrases.filter((p) => p.topic === topic);
    }

    // Filter by status if provided
    if (status) {
      phrases = phrases.filter((p) => p.status === status);
    }

    // Sort by created_at (newest first)
    phrases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return phrases;
  } catch (error) {
    console.error('Error getting saved phrases:', error);
    return [];
  }
};

/**
 * Update phrase practice statistics
 * @param {string} userId - User identifier
 * @param {string} phraseId - Phrase ID
 * @param {number} score - Practice score (0-100)
 * @param {number} masteryThreshold - Threshold for mastery (default 85)
 * @param {number} requiredStreakForMastery - Required success streak (default 3)
 * @returns {Object|null} Updated phrase or null if not found
 */
export const updatePhraseStats = (userId, phraseId, score, masteryThreshold = 85, requiredStreakForMastery = 3) => {
  try {
    const phrases = getSavedPhrases(userId);
    const phraseIndex = phrases.findIndex(p => p.id === phraseId);

    if (phraseIndex === -1) {
      console.error('Phrase not found:', phraseId);
      return null;
    }

    const phrase = phrases[phraseIndex];

    // Update practice count
    const newPracticeCount = phrase.practice_count + 1;

    // Calculate new average score
    const currentTotal = phrase.avg_score * phrase.practice_count;
    const newAvgScore = Math.round((currentTotal + score) / newPracticeCount);

    // Update success streak
    let newSuccessStreak = 0;
    if (score >= masteryThreshold) {
      newSuccessStreak = phrase.success_streak + 1;
    } else {
      newSuccessStreak = 0; // Reset streak on failure
    }

    // Determine new status based on success streak
    let newStatus = phrase.status;
    if (newSuccessStreak >= requiredStreakForMastery) {
      newStatus = 'mastered';
    } else if (newSuccessStreak >= 1 || newPracticeCount >= 2) {
      newStatus = 'learning';
    } else {
      newStatus = 'weak';
    }

    // Update phrase
    phrases[phraseIndex] = {
      ...phrase,
      practice_count: newPracticeCount,
      success_streak: newSuccessStreak,
      avg_score: newAvgScore,
      last_practiced_at: new Date().toISOString(),
      status: newStatus
    };

    localStorage.setItem(STORAGE_KEYS.savedPhrases(userId), JSON.stringify(phrases));

    return phrases[phraseIndex];
  } catch (error) {
    console.error('Error updating phrase stats:', error);
    return null;
  }
};

/**
 * Get phrases that should be practiced today
 * Priority: weak > learning > mastered (never practiced or not practiced in 7+ days)
 * @param {string} userId - User identifier
 * @param {number} limit - Max number to return (default 3)
 * @returns {Array} Phrases to practice
 */
export const getTodayPhrases = (userId, limit = 3) => {
  try {
    const allPhrases = getSavedPhrases(userId);

    if (allPhrases.length === 0) {
      return [];
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Priority scoring
    const scoredPhrases = allPhrases.map(phrase => {
      let priority = 0;

      // Status priority (weak = highest, learning = medium, mastered = low)
      if (phrase.status === 'weak') priority += 100;
      else if (phrase.status === 'learning') priority += 50;
      else if (phrase.status === 'mastered') priority += 10;

      // Never practiced = highest priority
      if (!phrase.last_practiced_at) {
        priority += 200;
      } else {
        // Recently created but not practiced
        const lastPracticed = new Date(phrase.last_practiced_at);
        const daysSinceLastPractice = (now - lastPracticed) / (1000 * 60 * 60 * 24);

        // Add priority based on days since last practice
        if (daysSinceLastPractice >= 7) priority += 150;
        else if (daysSinceLastPractice >= 3) priority += 80;
        else if (daysSinceLastPractice >= 1) priority += 40;
      }

      // Lower avg_score = higher priority
      if (phrase.avg_score < 60) priority += 30;
      else if (phrase.avg_score < 80) priority += 15;

      return { ...phrase, priority };
    });

    // Sort by priority (highest first) and return top N
    scoredPhrases.sort((a, b) => b.priority - a.priority);

    return scoredPhrases.slice(0, limit);
  } catch (error) {
    console.error('Error getting today phrases:', error);
    return [];
  }
};

/**
 * Remove a saved phrase
 * @param {string} userId - User identifier
 * @param {string} phraseIdOrText - Phrase ID or text to remove
 * @returns {boolean} Success status
 */
export const removeSavedPhrase = (userId, phraseIdOrText) => {
  try {
    const existing = getSavedPhrases(userId);
    const filtered = existing.filter(
      (p) => p.id !== phraseIdOrText && p.text_en.toLowerCase() !== phraseIdOrText.toLowerCase()
    );

    localStorage.setItem(STORAGE_KEYS.savedPhrases(userId), JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing phrase:', error);
    return false;
  }
};

/**
 * Get phrases grouped by topic
 * @param {string} userId - User identifier
 * @returns {Object} Phrases grouped by topic { topic: [phrases] }
 */
export const getPhrasesByTopic = (userId) => {
  try {
    const allPhrases = getSavedPhrases(userId);

    const grouped = allPhrases.reduce((acc, phrase) => {
      const topic = phrase.topic || 'other';
      if (!acc[topic]) {
        acc[topic] = [];
      }
      acc[topic].push(phrase);
      return acc;
    }, {});

    return grouped;
  } catch (error) {
    console.error('Error grouping phrases by topic:', error);
    return {};
  }
};

// ===== SESSION TRACKING =====

/**
 * Increment session count
 * @param {string} userId - User identifier
 * @returns {number} New session count
 */
export const incrementSessionCount = (userId) => {
  try {
    const current = getSessionCount(userId);
    const newCount = current + 1;

    localStorage.setItem(STORAGE_KEYS.sessionCount(userId), newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing session count:', error);
    return 0;
  }
};

/**
 * Get total session count
 * @param {string} userId - User identifier
 * @returns {number} Session count
 */
export const getSessionCount = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.sessionCount(userId));
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.error('Error getting session count:', error);
    return 0;
  }
};

// ===== AGGREGATE DATA =====

/**
 * Get aggregate user progress data
 * @param {string} userId - User identifier
 * @returns {Object} { weak_words, saved_phrases, session_count, stats }
 */
export const getUserProgress = (userId) => {
  try {
    const weakWords = getWeakWords(userId);
    const savedPhrases = getSavedPhrases(userId);
    const sessionCount = getSessionCount(userId);

    // Calculate additional stats
    const totalErrors = weakWords.reduce((sum, w) => sum + w.error_count, 0);
    const phrasesByTopic = getPhrasesByTopic(userId);
    const topicCounts = Object.keys(phrasesByTopic).reduce((acc, topic) => {
      acc[topic] = phrasesByTopic[topic].length;
      return acc;
    }, {});

    return {
      weak_words: weakWords,
      saved_phrases: savedPhrases,
      session_count: sessionCount,
      stats: {
        total_weak_words: weakWords.length,
        total_errors: totalErrors,
        total_saved_phrases: savedPhrases.length,
        phrases_by_topic: topicCounts
      }
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return {
      weak_words: [],
      saved_phrases: [],
      session_count: 0,
      stats: {
        total_weak_words: 0,
        total_errors: 0,
        total_saved_phrases: 0,
        phrases_by_topic: {}
      }
    };
  }
};

// ===== DATA MANAGEMENT =====

/**
 * Clear all user data (for testing or reset)
 * @param {string} userId - User identifier
 * @returns {boolean} Success status
 */
export const clearUserData = (userId) => {
  try {
    localStorage.removeItem(STORAGE_KEYS.weakWords(userId));
    localStorage.removeItem(STORAGE_KEYS.savedPhrases(userId));
    localStorage.removeItem(STORAGE_KEYS.sessionCount(userId));
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

/**
 * Export user data as JSON (for backup)
 * @param {string} userId - User identifier
 * @returns {string} JSON string of all user data
 */
export const exportUserData = (userId) => {
  try {
    const data = getUserProgress(userId);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return '{}';
  }
};

/**
 * Import user data from JSON (for restore)
 * @param {string} userId - User identifier
 * @param {string} jsonData - JSON string of user data
 * @returns {boolean} Success status
 */
export const importUserData = (userId, jsonData) => {
  try {
    const data = JSON.parse(jsonData);

    if (data.weak_words) {
      localStorage.setItem(
        STORAGE_KEYS.weakWords(userId),
        JSON.stringify(data.weak_words)
      );
    }

    if (data.saved_phrases) {
      localStorage.setItem(
        STORAGE_KEYS.savedPhrases(userId),
        JSON.stringify(data.saved_phrases)
      );
    }

    if (data.session_count) {
      localStorage.setItem(
        STORAGE_KEYS.sessionCount(userId),
        data.session_count.toString()
      );
    }

    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
};

// ===== USER SETTINGS =====

/**
 * Get user settings
 * @param {string} userId - User identifier
 * @returns {Object} User settings { pronunciationThreshold, ... }
 */
export const getUserSettings = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.settings(userId));

    if (stored) {
      return JSON.parse(stored);
    }

    // Default settings
    return {
      pronunciationThreshold: 85,
      autoSaveWeakWords: true,
      masteredWordThreshold: 90,
      masteredWordAttempts: 3
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {
      pronunciationThreshold: 85,
      autoSaveWeakWords: true,
      masteredWordThreshold: 90,
      masteredWordAttempts: 3
    };
  }
};

/**
 * Update user settings
 * @param {string} userId - User identifier
 * @param {Object} settings - Settings object { pronunciationThreshold, ... }
 * @returns {boolean} Success status
 */
export const updateUserSettings = (userId, settings) => {
  try {
    const currentSettings = getUserSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };

    localStorage.setItem(
      STORAGE_KEYS.settings(userId),
      JSON.stringify(updatedSettings)
    );

    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
};

/**
 * Get pronunciation threshold setting
 * @param {string} userId - User identifier
 * @returns {number} Threshold value (80, 85, or 90)
 */
export const getPronunciationThreshold = (userId) => {
  try {
    const settings = getUserSettings(userId);
    return settings.pronunciationThreshold || 85;
  } catch (error) {
    console.error('Error getting pronunciation threshold:', error);
    return 85;
  }
};

/**
 * Update pronunciation threshold
 * @param {string} userId - User identifier
 * @param {number} threshold - New threshold value (80, 85, or 90)
 * @returns {boolean} Success status
 */
export const updatePronunciationThreshold = (userId, threshold) => {
  try {
    return updateUserSettings(userId, { pronunciationThreshold: threshold });
  } catch (error) {
    console.error('Error updating pronunciation threshold:', error);
    return false;
  }
};

// ===== WEEKLY GOALS =====

/**
 * Get weekly goal (speaking minutes per day)
 * @param {string} userId - User identifier
 * @returns {number} Daily speaking goal in minutes (default: 15)
 */
export const getWeeklyGoal = (userId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.weeklyGoal(userId));
    return stored ? parseInt(stored, 10) : 15; // Default: 15 min/day
  } catch (error) {
    console.error('Error getting weekly goal:', error);
    return 15;
  }
};

/**
 * Update weekly goal
 * @param {string} userId - User identifier
 * @param {number} minutesPerDay - Daily speaking goal (10, 15, 20, 30)
 * @returns {boolean} Success status
 */
export const updateWeeklyGoal = (userId, minutesPerDay) => {
  try {
    localStorage.setItem(STORAGE_KEYS.weeklyGoal(userId), minutesPerDay.toString());
    return true;
  } catch (error) {
    console.error('Error updating weekly goal:', error);
    return false;
  }
};

// ===== WEEKLY STATS =====

/**
 * Get week range (start and end dates)
 * @param {number} weekOffset - 0 = this week, -1 = last week, etc.
 * @returns {Object} { startDate, endDate }
 */
export const getWeekRange = (weekOffset = 0) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days since Monday (start of week)
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  // Get Monday of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    startDate: monday,
    endDate: sunday
  };
};

/**
 * Count items created in date range
 * @param {Array} items - Array of items with created_at or mastered_at
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} dateField - Date field name (created_at, mastered_at, etc.)
 * @returns {number} Count
 */
const countInRange = (items, startDate, endDate, dateField = 'created_at') => {
  return items.filter(item => {
    if (!item[dateField]) return false;
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  }).length;
};

/**
 * Calculate average score in date range
 * @param {Array} items - Array of items with last_practiced_at and last_score/avg_score
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Average score (0-100)
 */
const getAvgScoreInRange = (items, startDate, endDate) => {
  const practicedInRange = items.filter(item => {
    if (!item.last_practiced_at) return false;
    const practiceDate = new Date(item.last_practiced_at);
    return practiceDate >= startDate && practiceDate <= endDate;
  });

  if (practicedInRange.length === 0) return 0;

  const totalScore = practicedInRange.reduce((sum, item) => {
    return sum + (item.avg_score || item.last_score || 0);
  }, 0);

  return Math.round(totalScore / practicedInRange.length);
};

/**
 * Get daily activity breakdown for a week
 * @param {string} userId - User identifier
 * @param {Date} startDate - Week start date
 * @param {Date} endDate - Week end date
 * @returns {Array} Array of 7 daily stats { date, speakingMinutes, wordsCount, phrasesCount }
 */
export const getDailyActivity = (userId, startDate, endDate) => {
  try {
    const weakWords = getWeakWords(userId);
    const masteredWords = getMasteredWords(userId);
    const savedPhrases = getSavedPhrases(userId);

    const dailyStats = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(startDate.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Count mastered words
      const wordsMastered = countInRange(masteredWords, dayStart, dayEnd, 'mastered_at');

      // Count phrases added
      const phrasesAdded = countInRange(savedPhrases, dayStart, dayEnd, 'created_at');

      // Count phrases practiced
      const phrasesPracticed = savedPhrases.filter(p => {
        if (!p.last_practiced_at) return false;
        const practiceDate = new Date(p.last_practiced_at);
        return practiceDate >= dayStart && practiceDate <= dayEnd;
      }).length;

      // Estimate speaking minutes (rough approximation)
      const estimatedMinutes = (wordsMastered * 2) + (phrasesAdded * 3) + (phrasesPracticed * 3);

      dailyStats.push({
        date: dayStart.toISOString(),
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayStart.getDay()],
        speakingMinutes: Math.min(estimatedMinutes, 60), // Cap at 60 for display
        wordsCount: wordsMastered,
        phrasesCount: phrasesAdded,
        practiceCount: phrasesPracticed
      });
    }

    return dailyStats;
  } catch (error) {
    console.error('Error getting daily activity:', error);
    return [];
  }
};

/**
 * Get weekly stats for a specific week
 * @param {string} userId - User identifier
 * @param {number} weekOffset - 0 = this week, -1 = last week
 * @returns {Object} Weekly statistics
 */
export const getWeeklyStats = (userId, weekOffset = 0) => {
  try {
    const { startDate, endDate } = getWeekRange(weekOffset);
    const weakWords = getWeakWords(userId);
    const masteredWords = getMasteredWords(userId);
    const savedPhrases = getSavedPhrases(userId);

    // Count words mastered this week
    const wordsMastered = countInRange(masteredWords, startDate, endDate, 'mastered_at');

    // Count phrases saved this week
    const phrasesSaved = countInRange(savedPhrases, startDate, endDate, 'created_at');

    // Get daily activity
    const dailyActivity = getDailyActivity(userId, startDate, endDate);

    // Calculate total speaking minutes
    const speakingMinutes = dailyActivity.reduce((sum, day) => sum + day.speakingMinutes, 0);

    // Count active days (days with any activity)
    const activeDays = dailyActivity.filter(day =>
      day.speakingMinutes > 0 || day.wordsCount > 0 || day.phrasesCount > 0
    ).length;

    // Calculate average pronunciation score
    const allPracticedItems = [
      ...weakWords.filter(w => w.last_practiced_at),
      ...savedPhrases.filter(p => p.last_practiced_at)
    ];
    const avgScore = getAvgScoreInRange(allPracticedItems, startDate, endDate);

    // Calculate practice streak (consecutive days with activity ending today)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const nextDate = new Date(checkDate);
      nextDate.setHours(23, 59, 59, 999);

      const hasActivity =
        countInRange(masteredWords, checkDate, nextDate, 'mastered_at') > 0 ||
        countInRange(savedPhrases, checkDate, nextDate, 'created_at') > 0 ||
        savedPhrases.some(p => {
          if (!p.last_practiced_at) return false;
          const practiceDate = new Date(p.last_practiced_at);
          return practiceDate >= checkDate && practiceDate <= nextDate;
        });

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        // If we find a gap (and it's not today), break
        break;
      }
    }

    return {
      weekOffset,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      speakingMinutes,
      wordsMastered,
      phrasesSaved,
      avgScore,
      activeDays,
      streak,
      dailyActivity
    };
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    return {
      weekOffset,
      speakingMinutes: 0,
      wordsMastered: 0,
      phrasesSaved: 0,
      avgScore: 0,
      activeDays: 0,
      streak: 0,
      dailyActivity: []
    };
  }
};

/**
 * Get weekly insights (comparing this week vs last week)
 * @param {string} userId - User identifier
 * @returns {Object} { thisWeek, lastWeek, insights: [] }
 */
export const getWeeklyInsights = (userId) => {
  try {
    const thisWeek = getWeeklyStats(userId, 0);
    const lastWeek = getWeeklyStats(userId, -1);
    const weeklyGoal = getWeeklyGoal(userId);
    const weeklyGoalMinutes = weeklyGoal * 7;

    const insights = [];

    // Speaking time progress
    const speakingChange = thisWeek.speakingMinutes - lastWeek.speakingMinutes;
    if (speakingChange > 0) {
      insights.push({
        type: 'improvement',
        icon: 'trendingUp',
        message: `You practiced ${speakingChange} more minutes this week!`,
        value: `+${speakingChange} min`
      });
    } else if (speakingChange < 0) {
      insights.push({
        type: 'warning',
        icon: 'trendingDown',
        message: `Practice time decreased by ${Math.abs(speakingChange)} minutes this week.`,
        value: `${speakingChange} min`
      });
    }

    // Goal progress
    const goalProgress = Math.round((thisWeek.speakingMinutes / weeklyGoalMinutes) * 100);
    if (thisWeek.speakingMinutes >= weeklyGoalMinutes) {
      insights.push({
        type: 'success',
        icon: 'trophy',
        message: `Amazing! You hit your weekly goal of ${weeklyGoalMinutes} minutes!`,
        value: `${goalProgress}%`
      });
    } else if (goalProgress >= 80) {
      insights.push({
        type: 'progress',
        icon: 'target',
        message: `Almost there! ${weeklyGoalMinutes - thisWeek.speakingMinutes} more minutes to reach your goal.`,
        value: `${goalProgress}%`
      });
    }

    // Consistency
    if (thisWeek.activeDays >= 5) {
      insights.push({
        type: 'consistency',
        icon: 'calendar',
        message: `Excellent consistency! You practiced ${thisWeek.activeDays} days this week.`,
        value: `${thisWeek.activeDays}/7 days`
      });
    }

    // Streak
    if (thisWeek.streak >= 7) {
      insights.push({
        type: 'streak',
        icon: 'fire',
        message: `You're on fire! ${thisWeek.streak}-day practice streak!`,
        value: `${thisWeek.streak} days`
      });
    } else if (thisWeek.streak >= 3) {
      insights.push({
        type: 'streak',
        icon: 'zap',
        message: `Keep it up! ${thisWeek.streak}-day streak going strong.`,
        value: `${thisWeek.streak} days`
      });
    }

    // Pronunciation improvement
    if (thisWeek.avgScore > 0 && lastWeek.avgScore > 0) {
      const scoreChange = thisWeek.avgScore - lastWeek.avgScore;
      if (scoreChange >= 5) {
        insights.push({
          type: 'improvement',
          icon: 'sparkles',
          message: `Your pronunciation improved by ${scoreChange}% this week!`,
          value: `+${scoreChange}%`
        });
      }
    }

    // Words mastered
    if (thisWeek.wordsMastered > 0) {
      insights.push({
        type: 'achievement',
        icon: 'award',
        message: `You mastered ${thisWeek.wordsMastered} ${thisWeek.wordsMastered === 1 ? 'word' : 'words'} this week!`,
        value: thisWeek.wordsMastered.toString()
      });
    }

    return {
      thisWeek,
      lastWeek,
      insights,
      goalProgress: {
        current: thisWeek.speakingMinutes,
        target: weeklyGoalMinutes,
        percentage: goalProgress
      }
    };
  } catch (error) {
    console.error('Error getting weekly insights:', error);
    return {
      thisWeek: getWeeklyStats(userId, 0),
      lastWeek: getWeeklyStats(userId, -1),
      insights: [],
      goalProgress: { current: 0, target: 105, percentage: 0 }
    };
  }
};
