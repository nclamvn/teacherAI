import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        const data = JSON.parse(stored);
        setProfile(data);
        setHasCompletedOnboarding(!!data.onboarding_completed);
      } else {
        // No profile yet - need onboarding
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };

      // Save to localStorage (mock backend for now)
      localStorage.setItem('user_profile', JSON.stringify(updated));

      setProfile(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const completeOnboarding = async (profileData) => {
    const updated = await updateProfile({
      ...profileData,
      user_id: 'user_001', // Mock user ID
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setHasCompletedOnboarding(true);
    return updated;
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      isLoading,
      hasCompletedOnboarding,
      updateProfile,
      completeOnboarding
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
