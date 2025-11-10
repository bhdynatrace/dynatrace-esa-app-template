import { useState } from 'react';
import { PasswordScreen } from './components/PasswordScreen';
import { SplashScreen } from './components/SplashScreen';
import DeepDivePresentation from './pages/DeepDivePresentation';

type AppStage = 'password' | 'splash' | 'presentation';

export const App = () => {
  const [stage, setStage] = useState<AppStage>('password');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAuthenticated = (adminMode: boolean) => {
    setIsAdmin(adminMode);
    setStage('splash');
  };

  const handleSplashComplete = () => {
    setStage('presentation');
  };

  if (stage === 'password') {
    return <PasswordScreen onAuthenticated={handleAuthenticated} />;
  }

  if (stage === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <DeepDivePresentation isAdmin={isAdmin} />;
};
