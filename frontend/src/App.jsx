import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import { LessonProvider } from './contexts/LessonContext';
import { StudioProvider } from './contexts/StudioContext';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import HomePage from './pages/home/HomePage';
import ProgressPage from './pages/progress/ProgressPage';
import StudioPage from './pages/studio/StudioPage';
import SettingsPage from './pages/settings/SettingsPage';
import './App.css';

function AppRoutes() {
  const { hasCompletedOnboarding, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Onboarding flow */}
      <Route
        path="/onboarding"
        element={
          hasCompletedOnboarding ? <Navigate to="/home" /> : <OnboardingPage />
        }
      />

      {/* Home / Mission Board */}
      <Route
        path="/home"
        element={
          hasCompletedOnboarding ? (
            <LessonProvider>
              <HomePage />
            </LessonProvider>
          ) : (
            <Navigate to="/onboarding" />
          )
        }
      />

      {/* Progress / Weekly Summary */}
      <Route
        path="/progress"
        element={
          hasCompletedOnboarding ? (
            <ProgressPage />
          ) : (
            <Navigate to="/onboarding" />
          )
        }
      />

      {/* Main studio */}
      <Route
        path="/studio"
        element={
          hasCompletedOnboarding ? (
            <StudioProvider>
              <LessonProvider>
                <StudioPage />
              </LessonProvider>
            </StudioProvider>
          ) : (
            <Navigate to="/onboarding" />
          )
        }
      />

      {/* Settings */}
      <Route path="/settings" element={<SettingsPage />} />

      {/* Default redirect */}
      <Route
        path="*"
        element={
          <Navigate to={hasCompletedOnboarding ? "/home" : "/onboarding"} />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <UserProgressProvider>
          <AppRoutes />
        </UserProgressProvider>
      </ProfileProvider>
    </BrowserRouter>
  );
}

export default App;
