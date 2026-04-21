import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Frown, Meh, SmileIcon, Laugh, Annoyed, Heart, Zap, Sparkles, Check, X, Info, Brain, Wind, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const moods = [
  { emoji: '🤩', label: 'Amazing', color: 'bg-accent-amber', icon: Sparkles },
  { emoji: '😊', label: 'Good', color: 'bg-primary-green', icon: SmileIcon },
  { emoji: '😐', label: 'Okay', color: 'bg-blue-400', icon: Meh },
  { emoji: '😔', label: 'Down', color: 'bg-blue-600', icon: Frown },
  { emoji: '😫', label: 'Stressed', color: 'bg-purple-500', icon: Annoyed },
  { emoji: '😤', label: 'Angry', color: 'bg-danger-red', icon: Zap },
  { emoji: '😴', label: 'Tired', color: 'bg-slate-500', icon: Meh },
  { emoji: '🥰', label: 'Grateful', color: 'bg-pink-400', icon: Heart },
];

const moodTips: Record<string, { title: string, tips: string[], icon: any }> = {
  'Stressed': {
    title: 'NEURAL RECALIBRATION REQUIRED',
    icon: Wind,
    tips: [
      'Initiate 4-7-8 Breathing: Inhale 4s, Hold 7s, Exhale 8s. Repeat 4 cycles.',
      'Magnesium Load: Consume almonds or dark leafy greens to dampen cortisol.',
      'Sensory Grounding: Name 5 things you see, 4 you feel, 3 you hear.'
    ]
  },
  'Angry': {
    title: 'EMOTIONAL VENTING PROTOCOL',
    icon: Zap,
    tips: [
      'Thermal Shock: Splash ice-cold water on your face to trigger the dive reflex.',
      'High-Intensity Burst: 20 rapid jumping jacks to burn off excess adrenaline.',
      'Box Breathing: 4s Inhale, 4s Hold, 4s Exhale, 4s Hold. Stabilize heart rate.'
    ]
  },
  'Down': {
    title: 'DOPAMINE SYNTHESIS PROTOCOL',
    icon: Brain,
    tips: [
      'Luminance Therapy: Seek direct sunlight for 10 minutes to trigger serotonin.',
      'Tactile Comfort: A warm shower or weighted blanket can regulate oxytocin levels.',
      'Micro-Win: Complete one 2-minute task (e.g., making the bed) to spark momentum.'
    ]
  },
  'Tired': {
    title: 'ENERGY OPTIMIZATION LOGIC',
    icon: Coffee,
    tips: [
      'Hydration Matrix: Drink 500ml of water. Dehydration is a primary fatigue vector.',
      'Postural Shift: Stand up and do 3 overhead stretches to increase oxygen flow.',
      'Tyrosine Intake: A small handful of pumpkin seeds or a banana for neural fuel.'
    ]
  },
  'Okay': {
    title: 'SYSTEM MAINTENANCE ACTIVE',
    icon: Sparkles,
    tips: [
      'Gratitude Sync: Identify one positive event from the last 24 hours.',
      'Hydration Check: Verify water consumption is on target for the day.',
      'Planning: Set one singular objective for the next 4 hours.'
    ]
  },
  'Amazing': {
    title: 'PEAK PERFORMANCE MODE',
    icon: Sparkles,
    tips: [
      'Intensity Scale: Perfect time for a high-intensity workout session.',
      'Cognitive Flow: Tackle your most complex deep-work task now.',
      'Externalize: Share your positive energy to boost group morale.'
    ]
  },
  'Good': {
    title: 'OPTIMAL STATUS REACHED',
    icon: SmileIcon,
    tips: [
      'Sustain Phase: Maintain balanced macros for your next meal.',
      'Steady State: Excellent window for moderate aerobic activity.',
      'Record State: Note what led to this mood for future replication.'
    ]
  },
  'Grateful': {
    title: 'OXYTOCIN RESONANCE',
    icon: Heart,
    tips: [
      'Connection: Message one person and express genuine appreciation.',
      'Journaling: Log this specific gratitude in your mission history.',
      'Mindfulness: Savor this feeling for 60 seconds without distraction.'
    ]
  }
};

export default function MoodTracker() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'moods'), orderBy('timestamp', 'desc'), limit(14));
    const unsub = onSnapshot(q, (s) => setHistory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  const logMood = async (mood: any) => {
    if (!user) return;
    setSelectedMood(mood);
    setActiveSuggestion(moodTips[mood.label]);
    
    await addDoc(collection(db, 'users', user.uid, 'moods'), {
      emoji: mood.emoji,
      label: mood.label,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary-green animate-ping" />
           <span className="text-[10px] font-black text-primary-green uppercase tracking-[0.4em]">Biometric Sync Active</span>
        </div>
        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-main">Affective State Analysis</h2>
        <p className="text-muted text-xs font-bold uppercase tracking-widest opacity-60">Quantifying the neural-metabolic link through emotional tracking.</p>
      </div>

      {/* Mood Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moods.map((mood, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => logMood(mood)}
            className={cn(
              "elite-card p-8 flex flex-col items-center gap-4 relative overflow-hidden group transition-all duration-500",
              selectedMood?.label === mood.label 
                ? "border-primary-green bg-primary-green/10 shadow-glow scale-105 z-10" 
                : "hover:border-primary-green/30 futuristic-glow"
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-[0.03] pointer-events-none transition-opacity",
              mood.color.replace('bg-', 'from-')
            )} />
            
            <span className="text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-md">{mood.emoji}</span>
            <span className="font-black text-[11px] uppercase tracking-[0.2em] text-main">{mood.label}</span>
            
            {selectedMood?.label === mood.label && (
              <motion.div 
                layoutId="mood-active-dot"
                className="absolute top-4 right-4 w-2 h-2 bg-primary-green rounded-full shadow-[0_0_8px_rgba(29,158,117,1)]"
              />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSuggestion && (
          <motion.div
            key={selectedMood?.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="elite-card p-0 overflow-hidden futuristic-glow border-primary-green/40 shadow-glow"
          >
            <div className="absolute top-0 right-0 p-6 flex gap-2">
               <div className="w-1 h-1 rounded-full bg-primary-green animate-pulse" />
               <div className="w-1 h-1 rounded-full bg-primary-green animate-pulse delay-75" />
               <div className="w-1 h-1 rounded-full bg-primary-green animate-pulse delay-150" />
            </div>

            <div className="p-8 scanline-overlay">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-3xl bg-primary-green/10 border border-primary-green/20 flex items-center justify-center text-primary-green shadow-inner">
                   <activeSuggestion.icon size={32} strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary-green uppercase tracking-[0.3em]">Wellness Intelligence Insight</p>
                    <h3 className="text-2xl font-black tracking-tight uppercase italic text-main">{activeSuggestion.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {activeSuggestion.tips.map((tip: string, idx: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="flex items-start gap-3 p-4 bg-bg-light/40 dark:bg-bg-dark/40 rounded-2xl border border-border-light dark:border-border-dark group hover:border-primary-green/30 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-lg bg-primary-green/10 flex items-center justify-center text-primary-green font-black text-[10px] mt-0.5">
                           {idx + 1}
                        </div>
                        <p className="text-sm font-medium text-main/80 group-hover:text-main transition-colors leading-relaxed">{tip}</p>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setActiveSuggestion(null);
                      setSelectedMood(null);
                    }}
                    className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] hover:text-danger-red transition-colors"
                  >
                    <X size={14} /> Clear Insight Buffer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood History HUD */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border-light/40 dark:border-border-dark/40 pb-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary-green rounded-full shadow-[0_0_8px_rgba(29,158,117,1)]" />
              <h3 className="text-xl font-black tracking-tight uppercase italic text-main">Temporal Drift History</h3>
           </div>
           <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary-green opacity-40" />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">72H Window Active</span>
           </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
           {history.length === 0 ? (
             <div className="w-full text-center py-20 opacity-20 border-2 border-dashed border-border-light dark:border-border-dark rounded-[32px]">
                <p className="font-black text-xs uppercase tracking-[0.4em]">Historical Buffer Exhausted / Initiate Log</p>
             </div>
           ) : (
             history.map((entry, i) => (
               <motion.div
                 key={entry.id}
                 initial={{ opacity: 0, scale: 0.9, x: 20 }}
                 animate={{ opacity: 1, scale: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 className="flex-shrink-0 flex flex-col items-center gap-3 group"
               >
                 <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-card-dark border border-border-light dark:border-border-dark flex items-center justify-center text-4xl shadow-sm hover:scale-110 transition-transform duration-500 hover:border-primary-green group-hover:shadow-glow">
                   {entry.emoji}
                 </div>
                 <div className="text-center space-y-0.5">
                   <p className="text-[9px] font-black text-main uppercase tracking-widest">{format(new Date(entry.timestamp), 'MMM dd')}</p>
                   <p className="text-[8px] font-bold text-muted uppercase tracking-[0.2em]">{format(new Date(entry.timestamp), 'HH:mm')}</p>
                 </div>
               </motion.div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
