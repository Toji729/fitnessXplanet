import React, { useState } from 'react';
import { Sun, Moon, Bell, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { isDark, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, title: 'GOAL REACHED', text: 'DAILY MACRO OBJECTIVE MET.', time: '02M AGO' },
    { id: 2, title: 'SYSTEM ALERT', text: 'HYDRATION LEVELS BELOW OPTIMAL.', time: '01H AGO' },
  ];

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="glass-header px-8 flex items-center justify-between shrink-0 relative">
      <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-50" />
      
      <div className="flex flex-col relative z-10">
        <div className="flex items-center gap-2 mb-0.5">
           <div className="w-1.5 h-1.5 rounded-full bg-primary-green shadow-[0_0_8px_rgba(29,158,117,1)]" />
           <span className="text-[9px] font-black text-primary-green uppercase tracking-[0.4em]">Node: Active</span>
        </div>
        <h1 className="text-xl font-black text-main uppercase tracking-tight italic">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-6 relative z-10">
        <div className="hidden lg:flex flex-col items-end mr-4">
           <p className="text-[10px] font-black text-main uppercase tracking-[0.2em]">{format(new Date(), 'EEEE')}</p>
           <p className="text-[9px] font-bold text-muted uppercase tracking-[0.1em]">{format(new Date(), 'MMMM do, yyyy')}</p>
        </div>

        <button 
          onClick={toggleDarkMode}
          className="p-2.5 hover:bg-bg-light dark:hover:bg-bg-dark rounded-xl text-muted transition-all active:scale-90 border border-transparent hover:border-border-light dark:hover:border-border-dark"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={20} className="text-accent-amber" /> : <Moon size={20} className="text-blue-500" />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 hover:bg-bg-light dark:hover:bg-bg-dark rounded-xl text-muted relative transition-all active:scale-90 border border-transparent hover:border-border-light dark:hover:border-border-dark"
          >
            <Bell size={20} />
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-danger-red rounded-full shadow-[0_0_5px_rgba(239,68,68,1)]"
            />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute right-0 mt-5 w-80 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden futuristic-glow"
                >
                  <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-bg-light dark:bg-bg-dark/50">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-3 bg-primary-green rounded-full" />
                       <h3 className="font-black text-main text-[10px] uppercase tracking-[0.2em]">Live Data Stream</h3>
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-danger-red transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center opacity-20">
                         <Bell size={40} className="mx-auto mb-4" />
                         <p className="text-[10px] font-black text-muted uppercase tracking-widest">Buffer Empty</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-5 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-bg-light dark:hover:bg-bg-dark/80 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-black text-[11px] text-main group-hover:text-primary-green transition-colors tracking-tight uppercase italic">{n.title}</p>
                            <span className="text-[8px] font-black text-muted uppercase">{n.time}</span>
                          </div>
                          <p className="text-[11px] font-medium text-muted leading-tight uppercase opacity-70 group-hover:opacity-100 transition-opacity tracking-tight">{n.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 text-center bg-bg-light dark:bg-bg-dark/50 border-t border-border-light dark:border-border-dark">
                    <button className="text-[9px] font-black text-primary-green uppercase tracking-[0.3em] hover:text-primary-dark transition-colors">
                      Clear System Cache
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
