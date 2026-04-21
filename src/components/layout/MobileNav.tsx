import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Utensils, 
  CheckCircle2, 
  MessageSquare, 
  Smile
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mobileItems = [
  { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
  { id: 'log', label: 'Log', icon: Utensils },
  { id: 'habits', label: 'Habits', icon: CheckCircle2 },
  { id: 'advisor', label: 'Advisor', icon: MessageSquare },
  { id: 'mood', label: 'Mood', icon: Smile },
];

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/70 dark:bg-card-dark/70 backdrop-blur-md border-t border-border-light dark:border-border-dark flex items-center justify-around px-2 z-50">
      {mobileItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className="flex flex-col items-center justify-center gap-1 group flex-1"
        >
          <div className={cn(
            "p-1 rounded-lg transition-all duration-200",
            activeTab === item.id ? "text-primary-green scale-110" : "text-muted group-hover:text-primary-green"
          )}>
            <item.icon size={20} />
          </div>
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            activeTab === item.id ? "text-primary-green" : "text-muted"
          )}>
            {item.label}
          </span>
          {activeTab === item.id && (
            <motion.div
              layoutId="mobileTabUnderline"
              className="absolute -bottom-1 w-8 h-0.5 bg-primary-green rounded-full"
            />
          )}
        </button>
      ))}
    </nav>
  );
};
