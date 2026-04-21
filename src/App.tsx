import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { loginWithGoogle } from './lib/firebase';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Leaf } from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import Dashboard from './pages/Dashboard';
import LogMeal from './pages/LogMeal';
import Habits from './pages/HabitTracker';
import Advisor from './pages/Advisor';
import MoodTracker from './pages/MoodTracker';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

const AppContent = () => {
  const { user, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-primary-green mb-4"
        >
          <Leaf size={48} />
        </motion.div>
        <div className="w-48 h-1 overflow-hidden bg-border-light dark:bg-border-dark rounded-full">
          <motion.div 
            className="h-full bg-primary-green"
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-light dark:bg-bg-dark p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="elite-card max-w-md w-full p-8 text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-green/10 text-primary-green mb-2">
            <Leaf size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-main">NutriSense</h1>
            <p className="text-muted text-sm">Elevate your nutrition with AI-powered insights and professional tracking.</p>
          </div>
          <button
            onClick={loginWithGoogle}
            className="w-full elite-button-primary flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-muted underline">
             <span>Terms</span>
             <span>Privacy</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onAddMeal={() => setActiveTab('log')} />;
      case 'log': return <LogMeal />;
      case 'habits': return <Habits />;
      case 'advisor': return <Advisor />;
      case 'mood': return <MoodTracker />;
      case 'analytics': return <Analytics />;
      case 'profile': return <Profile />;
      default: return <Dashboard onAddMeal={() => setActiveTab('log')} />;
    }
  };

  const getPageTitle = () => {
    const item = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'log', label: 'Log Meal' },
      { id: 'habits', label: 'Daily Habits' },
      { id: 'advisor', label: 'NutriSense AI' },
      { id: 'mood', label: 'Mood Tracking' },
      { id: 'analytics', label: 'Insights & Analytics' },
      { id: 'profile', label: 'Your Profile' },
    ].find(i => i.id === activeTab);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="flex bg-bg-light dark:bg-bg-dark h-screen overflow-hidden relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      <main 
        className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden"
      >
        <div className="w-full flex flex-col h-full">
          <Header pageTitle={getPageTitle()} />
          
          <div className="flex-1 overflow-y-auto w-full pb-20 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="max-w-7xl mx-auto w-full p-4 md:p-8"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

