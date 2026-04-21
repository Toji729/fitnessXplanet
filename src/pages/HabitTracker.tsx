import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2, Flame, Award, Trash, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

export default function HabitTracker() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'habits'));
    const unsub = onSnapshot(q, (s) => setHabits(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  const addHabit = async () => {
    if (!user || !newHabit.trim()) return;
    await addDoc(collection(db, 'users', user.uid, 'habits'), {
      title: newHabit,
      completed: false,
      streak: 0,
      userId: user.uid,
      lastCompletedAt: null
    });
    setNewHabit('');
    setShowInput(false);
  };

  const toggleHabit = async (habit: any) => {
    if (!user) return;
    const isCompleting = !habit.completed;
    
    await updateDoc(doc(db, 'users', user.uid, 'habits', habit.id), {
      completed: isCompleting,
      streak: isCompleting ? (habit.streak || 0) + 1 : Math.max(0, (habit.streak || 0) - 1),
      lastCompletedAt: isCompleting ? new Date().toISOString() : habit.lastCompletedAt
    });

    if (isCompleting) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1D9E75', '#F59E0B', '#FFFFFF']
      });
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'habits', id));
  };

  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* HUD Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="elite-card md:col-span-2 p-8 flex items-center justify-between bg-primary-dark text-white relative overflow-hidden scanline-overlay futuristic-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-green/20 to-transparent pointer-events-none" />
          <div className="space-y-4 relative z-10">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">Efficiency Pulse</p>
             </div>
             <div>
                <h3 className="text-5xl font-black italic tracking-tighter">{progress}%</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Mission Integrity / {completedCount} OF {habits.length} ACTIVE</p>
             </div>
          </div>
          <div className="relative w-32 h-32 hidden sm:block">
             <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
               <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
               <motion.circle 
                 cx="64" cy="64" r="58" fill="none" stroke="#1D9E75" strokeWidth="8"
                 strokeDasharray="364.4"
                 initial={{ strokeDashoffset: 364.4 }}
                 animate={{ strokeDashoffset: 364.4 - (364.4 * progress) / 100 }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 strokeLinecap="round"
                 className="shadow-glow"
               />
             </svg>
             <Award className="absolute inset-0 m-auto text-primary-green" size={32} />
          </div>
        </div>

        <div className="elite-card p-8 flex flex-col justify-center gap-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Flame size={80} className="rotate-12" />
           </div>
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 flex items-center justify-center text-accent-amber border border-accent-amber/20 shadow-inner">
               <Flame size={28} className={cn(progress > 0 ? "animate-bounce" : "")} />
             </div>
             <div>
               <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Streak Vector</p>
               <h3 className="text-2xl font-black text-main">SUPREME</h3>
             </div>
           </div>
           <p className="text-[11px] text-muted font-medium italic leading-relaxed">Systematic repetition leads to neurobiological evolution.</p>
        </div>
      </motion.div>

      {/* Directives Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-light/40 dark:border-border-dark/40 pb-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary-green rounded-full shadow-[0_0_8px_rgba(29,158,117,1)]" />
             <h2 className="text-2xl font-black tracking-tight uppercase italic">Active Directives</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-green text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-button hover:shadow-glow transition-all"
          >
            <Plus size={16} strokeWidth={3} /> NEW COMMAND
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {showInput && (
              <motion.div
                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                className="overflow-hidden"
              >
                <div className="elite-card p-3 flex gap-3 futuristic-glow border-primary-green/50">
                  <input
                    autoFocus
                    type="text"
                    placeholder="ENTER MISSION OBJECTIVE..."
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                    className="flex-1 bg-transparent border-none focus:ring-0 px-4 font-bold text-sm placeholder:text-muted/30 uppercase tracking-widest"
                  />
                  <button 
                    onClick={addHabit}
                    className="bg-primary-green text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all"
                  >
                    DEPLOY
                  </button>
                  <button 
                    onClick={() => setShowInput(false)}
                    className="p-3 text-muted hover:text-danger-red transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {habits.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-24 bg-white/5 dark:bg-card-dark/5 rounded-[32px] border-2 border-dashed border-border-light/40 dark:border-border-dark/40 group cursor-pointer hover:border-primary-green/40 transition-all"
               onClick={() => setShowInput(true)}
             >
                <CheckCircle2 size={64} className="mx-auto text-muted opacity-10 mb-6 group-hover:scale-110 transition-transform" />
                <p className="text-muted font-black text-xs uppercase tracking-[0.4em]">Directives Offline / Initiate First Entry</p>
             </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit, i) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "elite-card p-6 flex flex-col gap-4 group transition-all duration-500 hover:scale-[1.02]",
                    habit.completed ? "bg-bg-light/40 dark:bg-bg-dark/40 opacity-70 border-none" : "hover:border-primary-green/40 futuristic-glow"
                  )}
                >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <p className="text-[9px] font-black text-primary-green uppercase tracking-[0.3em]">Module {i < 9 ? `0${i+1}` : i+1}</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-green opacity-30 group-hover:animate-ping" />
                     </div>
                     <button 
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-danger-red transition-all rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>

                  <div className="flex items-center gap-5">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => toggleHabit(habit)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                        habit.completed 
                          ? "bg-primary-green text-white shadow-button scale-110" 
                          : "bg-white dark:bg-card-dark border-2 border-border-light dark:border-border-dark text-transparent hover:border-primary-green relative overflow-hidden"
                      )}
                    >
                      {habit.completed ? (
                        <CheckCircle2 size={24} strokeWidth={3} />
                      ) : (
                        <div className="absolute inset-0 bg-primary-green opacity-0 hover:opacity-10 transition-opacity" />
                      )}
                    </motion.button>
                    
                    <div className="flex flex-col min-w-0">
                      <span className={cn(
                        "font-black text-lg tracking-tight uppercase truncate transition-all duration-500",
                        habit.completed ? "line-through text-muted italic" : "text-main"
                      )}>
                        {habit.title}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent-amber/10 border border-accent-amber/20">
                           <Flame size={12} className="text-accent-amber" />
                           <span className="text-[9px] font-black text-accent-amber uppercase tracking-widest">{habit.streak || 0} DAY STREAK</span>
                         </div>
                         <div className="w-1 h-1 rounded-full bg-muted opacity-30" />
                         <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Level: High</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
