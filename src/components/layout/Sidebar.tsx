import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Utensils, 
  CheckCircle2, 
  MessageSquare, 
  Smile, 
  BarChart3, 
  User as UserIcon,
  Leaf,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log', label: 'Log Meal', icon: Utensils },
  { id: 'habits', label: 'Habits', icon: CheckCircle2 },
  { id: 'advisor', label: 'Advisor', icon: MessageSquare },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const { profile } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="hidden lg:flex flex-col h-screen sticky left-0 top-0 bg-white border-r border-border-light z-50 transition-colors dark:bg-card-dark dark:border-border-dark shrink-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary-green/[0.02] to-transparent pointer-events-none" />
      
      <div className="p-8 flex items-center justify-between relative">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary-green blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-primary-green flex items-center justify-center text-white shadow-glow">
                  <Leaf size={24} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter text-main uppercase italic leading-none">NutriSense</span>
                <span className="text-[8px] font-black text-primary-green uppercase tracking-[0.4em] mt-1">OS v2.4.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-bg-light dark:hover:bg-bg-dark rounded-xl text-muted transition-all hover:text-primary-green active:scale-90"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 relative z-10">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300",
                isActive 
                  ? "text-primary-green bg-primary-green/5 shadow-inner" 
                  : "text-muted hover:text-primary-green hover:bg-bg-light dark:hover:bg-bg-dark"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary-green rounded-full shadow-[0_0_8px_rgba(29,158,117,1)]"
                />
              )}
              
              <div className={cn(
                "relative transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-primary-green" : "opacity-40 group-hover:opacity-100"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className={cn(
                    "font-black text-[11px] uppercase tracking-[0.1em] transition-all",
                    isActive ? "translate-x-0" : "-translate-x-1 group-hover:translate-x-0"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      className="text-[7px] font-bold uppercase tracking-[0.2em]"
                    >
                      Sector Identified
                    </motion.span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 relative z-10">
        {profile && (
          <div className={cn(
            "elite-card p-3 flex items-center gap-3 bg-bg-light/40 dark:bg-bg-dark/40 border-none transition-all duration-500",
            isCollapsed ? "flex-col py-6" : "px-4"
          )}>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-green blur-sm opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <div className="relative w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-black border-2 border-primary-green/30 overflow-hidden shadow-inner uppercase tracking-tighter">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary-green rounded-full border-2 border-white dark:border-card-dark shadow-sm" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-main uppercase tracking-tight truncate italic">{profile?.name.split(' ')[0]}</p>
                <div className="flex items-center gap-1 opacity-40">
                  <span className="w-1 h-1 rounded-full bg-primary-green animate-pulse" />
                  <p className="text-[8px] font-bold text-muted uppercase tracking-widest truncate">Auth LVL 4</p>
                </div>
              </div>
            )}

            <button 
              onClick={logout}
              className={cn(
                "p-2.5 text-muted hover:text-danger-red transition-all hover:bg-danger-red/5 rounded-xl border border-transparent hover:border-danger-red/20 active:scale-95",
                isCollapsed && "mt-2"
              )}
              title="Terminate Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
