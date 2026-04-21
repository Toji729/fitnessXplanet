import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Droplets, 
  Plus, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Beef,
  Wheat,
  Pizza,
  Utensils,
  CheckCircle2,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="elite-card p-5 group flex flex-col gap-4 relative overflow-hidden futuristic-glow"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] -mr-8 -mt-8 rounded-full translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-700 ${color}`} />
    <div className="flex items-center justify-between z-10">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="flex flex-col items-end">
        <TrendingUp size={14} className="text-primary-green opacity-40 mb-1" />
        <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{label}</span>
      </div>
    </div>
    <div className="z-10">
      <div className="flex items-baseline gap-1.5">
         <span className="text-3xl font-black text-main tabular-nums tracking-tighter">{value}</span>
         <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Unit: G</span>
      </div>
    </div>
    <div className="relative h-1.5 w-full bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: '65%' }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: delay + 0.2 }}
        className={`h-full ${color} relative`}
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
      </motion.div>
    </div>
  </motion.div>
);

export default function Dashboard({ onAddMeal }: { onAddMeal: () => void }) {
  const { profile, user } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'users', user.uid, 'meals'),
      where('timestamp', '>=', today.toISOString()),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeals(mealList);
      
      const cal = mealList.reduce((acc, m: any) => acc + (m.calories || 0), 0);
      const prot = mealList.reduce((acc, m: any) => acc + (m.protein || 0), 0);
      const car = mealList.reduce((acc, m: any) => acc + (m.carbs || 0), 0);
      const ft = mealList.reduce((acc, m: any) => acc + (m.fat || 0), 0);
      
      setCaloriesConsumed(cal);
      setMacros({ protein: prot, carbs: car, fat: ft });
    });

    return () => unsubscribe();
  }, [user]);

  const calorieGoal = profile?.calorieGoal || 2000;
  const caloriesPct = Math.min((caloriesConsumed / calorieGoal) * 100, 100);
  const caloriesLeft = Math.max(calorieGoal - caloriesConsumed, 0);

  const handleDeleteMeal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'meals', id));
  };

  const getRingColor = () => {
    if (caloriesPct < 80) return "text-primary-green";
    if (caloriesPct < 100) return "text-accent-amber";
    return "text-danger-red";
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section - Futuristic HUD style */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary-green animate-ping" />
            <span className="text-[10px] font-bold text-primary-green uppercase tracking-[0.3em]">System Online</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-main">
            Welcome back, <span className="text-primary-green italic opacity-90">{profile?.name.split(' ')[0]}</span>
          </h2>
          <p className="text-sm font-bold text-muted uppercase tracking-[0.1em] flex items-center gap-2">
            <span className="opacity-50 tracking-normal text-xs">{format(new Date(), 'EEEE')}</span>
            <span className="text-primary-green">/</span>
            <span>{format(new Date(), 'MMMM do, yyyy')}</span>
          </p>
        </div>
        
        <div className="elite-card px-6 py-4 flex items-center gap-4 border-l-4 border-l-accent-amber futuristic-glow">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-amber rounded-xl blur-md opacity-20 animate-pulse" />
            <div className="relative w-12 h-12 rounded-xl bg-accent-amber/10 flex items-center justify-center text-accent-amber">
              <Flame size={24} className={cn(caloriesConsumed > 0 ? "animate-bounce" : "")} />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Operational Streak</p>
            <p className="font-black text-2xl text-main">07 <span className="text-xs opacity-50 font-medium">Days</span></p>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Consumption Node */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 elite-card p-8 flex flex-col items-center justify-center relative overflow-hidden scanline-overlay"
        >
          <div className="absolute top-0 right-0 p-4">
             <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-green opacity-50" />
                <div className="w-1.5 h-1.5 rounded-full bg-border-light dark:bg-border-dark" />
                <div className="w-1.5 h-1.5 rounded-full bg-border-light dark:bg-border-dark" />
             </div>
          </div>
          
          <p className="text-[10px] font-black text-muted mb-10 uppercase tracking-[0.4em] text-center w-full">Core Energy Index</p>
          
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Background Rings */}
            <div className="absolute inset-0 rounded-full border border-primary-green/10 scale-110" />
            <div className="absolute inset-0 rounded-full border border-primary-green/5 scale-[1.2] opacity-50" />
            
            <svg className="w-full h-full -rotate-90 relative z-10 drop-shadow-[0_0_8px_rgba(29,158,117,0.3)]">
              <circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-border-light dark:text-border-dark opacity-30"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray="703.7"
                initial={{ strokeDashoffset: 703.7 }}
                animate={{ strokeDashoffset: 703.7 - (703.7 * caloriesPct) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                strokeLinecap="round"
                className={cn("drop-shadow-glow", getRingColor())}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black tracking-tighter text-main"
              >
                {caloriesLeft}
              </motion.span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-primary-green text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Remaining</span>
                <span className="text-muted text-[8px] font-bold uppercase tracking-widest opacity-40">Kilocalories / Day</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 w-full mt-12 gap-8 pt-6 border-t border-border-light/40 dark:border-border-dark/40">
            <div className="text-center group cursor-pointer">
              <p className="text-muted text-[9px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-primary-green transition-colors">Yielded</p>
              <p className="text-2xl font-black tabular-nums">{caloriesConsumed}</p>
            </div>
            <div className="text-center group cursor-pointer border-l border-border-light/40 dark:border-border-dark/40">
              <p className="text-muted text-[9px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-primary-green transition-colors">Target</p>
              <p className="text-2xl font-black tabular-nums">{calorieGoal}</p>
            </div>
          </div>
        </motion.div>

        {/* Macro Modules */}
        <div className="grid grid-cols-1 gap-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
             <StatCard icon={Beef} label="Protein" value={macros.protein} color="bg-primary-green" delay={0.1} />
             <StatCard icon={Wheat} label="Carbs" value={macros.carbs} color="bg-blue-500" delay={0.2} />
             <StatCard icon={Pizza} label="Fats" value={macros.fat} color="bg-accent-amber" delay={0.3} />
             <StatCard icon={Droplets} label="Fiber" value={Math.round(macros.carbs * 0.1)} color="bg-purple-500" delay={0.4} />
          </div>

          {/* Holographic Tip Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="elite-card p-6 bg-primary-dark relative overflow-hidden group shadow-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-green/20 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 p-4">
              <Leaf size={40} className="text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-0.5 w-6 bg-primary-green" />
                <span className="text-primary-green text-[10px] font-black uppercase tracking-[0.3em]">Intelligent Insight</span>
              </div>
              <h4 className="text-xl font-black text-white mb-2 leading-tight">Mastering Metabolism</h4>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                Strategic hydration between meals can increase your resting metabolic rate by <span className="text-white font-bold">24-30%</span> for up to 60 minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Secondary Data Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Log Module */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="lg:col-span-2 elite-card p-8 flex flex-col futuristic-glow"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-1 h-6 bg-primary-green rounded-full shadow-[0_0_8px_rgba(29,158,117,1)]" />
               <h3 className="text-xl font-black tracking-tight uppercase">Operational Logs</h3>
            </div>
            <button 
              onClick={onAddMeal}
              className="px-4 py-2 bg-primary-green/5 text-primary-green text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-primary-green/20 hover:bg-primary-green hover:text-white transition-all shadow-sm active:scale-95"
            >
              + Initiate Log
            </button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {meals.length === 0 ? (
               <div className="text-center py-16 opacity-30">
                 <Utensils size={48} className="mx-auto mb-4" />
                 <p className="text-xs font-bold uppercase tracking-widest">Database Empty for Current Cycle</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-3">
                 {meals.map((meal, idx) => (
                   <motion.div
                     key={meal.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="group elite-card border-none bg-bg-light/40 dark:bg-bg-dark/40 hover:bg-white dark:hover:bg-card-dark p-4 flex items-center justify-between transition-all duration-300"
                   >
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform",
                          meal.mealType === 'breakfast' ? 'bg-primary-green text-white' : 
                          meal.mealType === 'lunch' ? 'bg-blue-500 text-white' : 
                          meal.mealType === 'snack' ? 'bg-accent-amber text-white' : 'bg-purple-500 text-white'
                        )}>
                          {meal.mealType.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-sm text-main tracking-tight group-hover:text-primary-green transition-colors">{meal.foodName}</p>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-muted opacity-30" />
                             <p className="text-[9px] text-muted uppercase font-black tracking-widest">{meal.mealType}</p>
                          </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-sm font-black tabular-nums">{meal.calories}</p>
                           <p className="text-[8px] font-bold text-muted uppercase tracking-widest">Kcal</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-danger-red/10 text-danger-red rounded-xl hover:bg-danger-red hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
        </motion.div>

        {/* Support Modules */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="elite-card p-8 flex flex-col futuristic-glow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-[0.03] rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-[10px] font-black uppercase text-muted mb-6 tracking-[0.3em] flex items-center justify-between">
               Hydration Balance
               <Droplets size={14} className="text-blue-400" />
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWaterGlasses(i + 1)}
                  className={cn(
                    "relative h-14 rounded-xl border-2 transition-all duration-300 overflow-hidden group",
                    i < waterGlasses 
                      ? "bg-blue-500 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                      : "border-border-light dark:border-border-dark hover:border-blue-400/50"
                  )}
                >
                  {i < waterGlasses && (
                    <motion.div 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="absolute inset-x-0 bottom-0 top-1/3 bg-white/20 backdrop-blur-sm"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
                     <span className="text-[8px] font-black text-white">{i + 1}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="mt-8 flex items-baseline justify-between">
               <p className="text-3xl font-black tabular-nums tracking-tighter">
                 {(waterGlasses * 0.25).toFixed(1)} <span className="text-xs opacity-40 font-medium">Liters</span>
               </p>
               <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ring-1 ring-blue-500/20 px-2 py-1 rounded-md">8 / 8 Units</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="elite-card p-8 flex flex-col shadow-inner bg-bg-light/20 dark:bg-bg-dark/20"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase text-muted tracking-[0.3em]">Core Directives</h3>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary-green" />
                 <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">2 / 3</span>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { label: '30 Min Optimal Cardio', done: true },
                { label: 'Micronutrient Intake', done: true },
                { label: 'Neural Recalibration', done: false, sub: 'Bedtime Meditation' }
              ].map((habit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                    habit.done ? "bg-primary-green text-white shadow-[0_0_10px_rgba(29,158,117,0.4)]" : "border-2 border-border-light dark:border-border-dark"
                  )}>
                    {habit.done && <CheckCircle2 size={14} strokeWidth={4} />}
                  </div>
                  <div>
                    <span className={cn(
                      "text-xs font-black uppercase tracking-wider block",
                      habit.done ? "line-through text-muted opacity-50" : "text-main"
                    )}>
                      {habit.label}
                    </span>
                    {!habit.done && habit.sub && <span className="text-[9px] text-muted uppercase font-bold tracking-widest block mt-0.5">{habit.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
