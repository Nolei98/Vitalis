import React, { useState, useEffect } from 'react';
import AuthPage from './components/auth/AuthPage';
import OnboardingForm from './components/onboarding/OnboardingForm';
import Dashboard from './components/dashboard/Dashboard';
import AddFoodForm from './components/foods/AddFoodForm';
import Recommendations from './components/foods/Recommendations';
import ProfilePage from './components/profile/ProfilePage';
import BottomNav from './components/ui/BottomNav';
import { AppView, UserProfile } from './types';
import { getCurrentUser, logout, updateUser } from './services/authService';
import { hasPhysicalProfile } from './utils/nutrition';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentView(hasPhysicalProfile(storedUser) ? 'dashboard' : 'onboarding');
    }
    setIsReady(true);
  }, []);

  const handleAuthSuccess = (u: UserProfile) => {
    setUser(u);
    setCurrentView(hasPhysicalProfile(u) ? 'dashboard' : 'onboarding');
  };

  // Persiste qualquer mudança no perfil (metas, dados físicos) na sessão + base de usuários.
  const handleUserChange = (u: UserProfile) => {
    const saved = updateUser(u);
    setUser(saved);
  };

  const handleOnboardingComplete = (u: UserProfile) => {
    handleUserChange(u);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentView('login');
  };

  if (!isReady) return null;

  if (!user || currentView === 'login' || currentView === 'register') {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'onboarding') {
    return <OnboardingForm user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen font-sans selection:bg-accent-500/20 selection:text-green-900">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-32">
        {currentView === 'dashboard' && <Dashboard user={user} onUserChange={handleUserChange} />}
        {currentView === 'add-food' && <AddFoodForm onAdd={() => setCurrentView('dashboard')} onCancel={() => setCurrentView('dashboard')} />}
        {currentView === 'recommendations' && <Recommendations user={user} />}
        {currentView === 'profile' && <ProfilePage user={user} onEditProfile={() => setCurrentView('onboarding')} onLogout={handleLogout} />}
      </main>

      <BottomNav current={currentView} onNavigate={setCurrentView} onAdd={() => setCurrentView('dashboard')} />
    </div>
  );
};

export default App;
