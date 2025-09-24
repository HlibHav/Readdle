import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './state/store';
import { BrowserView } from './views/BrowserView';
import { LibraryView } from './views/LibraryView';
import { Layout } from './components/Layout';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { useEffect, useState } from 'react';

function App() {
  const { 
    hasSeenOnboarding, 
    isOnboardingActive, 
    startOnboarding, 
    completeOnboarding
  } = useAppStore();
  
  const [showWelcome, setShowWelcome] = useState(!hasSeenOnboarding);

  const handleStartOnboarding = () => {
    setShowWelcome(false);
    startOnboarding();
  };

  const handleSkipOnboarding = () => {
    setShowWelcome(false);
    completeOnboarding();
  };

  const handleCompleteOnboarding = () => {
    completeOnboarding();
  };


  // Show welcome screen for new users
  if (showWelcome) {
    return (
      <WelcomeScreen
        onStartOnboarding={handleStartOnboarding}
        onSkipOnboarding={handleSkipOnboarding}
      />
    );
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<BrowserView />} />
          <Route path="/library" element={<LibraryView />} />
        </Routes>
      </Layout>
      
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingActive}
        onComplete={handleCompleteOnboarding}
      />
    </>
  );
}

export default App;
