import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Calendar, LogOut, Save, ShieldAlert, Heart, Activity, Ruler, TrendingDown, TrendingUp, Zap, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db, logout } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function Profile() {
  const { profile, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    height: profile?.height || 170,
    weight: profile?.weight || 70,
    calorieGoal: profile?.calorieGoal || 2000,
    activityLevel: profile?.activityLevel || 'moderate',
    fitnessGoal: profile?.fitnessGoal || 'maintain'
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateSuggestedCalories = () => {
    // Basic Harris-Benedict
    const bmr = 10 * formData.weight + 6.25 * formData.height - 5 * 25 + 5; 
    const multipliers: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extra_active: 1.9 };
    const maintenance = Math.round(bmr * (multipliers[formData.activityLevel] || 1.55));
    
    switch (formData.fitnessGoal) {
      case 'lose': return maintenance - 500;
      case 'gain': return maintenance + 500;
      case 'physique': return maintenance + 300;
      default: return maintenance;
    }
  };

  const syncGoal = () => {
    setFormData(prev => ({ ...prev, calorieGoal: calculateSuggestedCalories() }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="elite-card overflow-hidden">
        <div className="h-32 bg-primary-green/10" />
        <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row md:items-end gap-6">
           <div className="w-24 h-24 rounded-full bg-primary-green border-4 border-white dark:border-card-dark flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
             {profile?.photoURL ? (
               <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               profile?.name.charAt(0)
             )}
           </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-3xl font-black text-main uppercase italic tracking-tighter">{profile?.name}</h2>
              <div className="flex flex-wrap gap-4 text-muted text-sm font-bold uppercase tracking-widest">
               <span className="flex items-center gap-1"><Mail size={14} /> {profile?.email}</span>
               <span className="flex items-center gap-1"><Calendar size={14} /> Joined {profile?.memberSince ? format(new Date(profile.memberSince), 'MMMM yyyy') : 'Recently'}</span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="elite-card p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black flex items-center gap-2 px-1 uppercase tracking-tighter italic">
                <Target size={22} className="text-primary-green shadow-glow" /> Primary Objective
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'lose', label: 'Lose Weight', icon: TrendingDown, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                  { id: 'maintain', label: 'Be Fit', icon: Activity, color: 'text-primary-green', bg: 'bg-primary-green/5' },
                  { id: 'gain', label: 'Gain Weight', icon: TrendingUp, color: 'text-accent-amber', bg: 'bg-accent-amber/5' },
                  { id: 'physique', label: 'Gain Physique', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setFormData({ ...formData, fitnessGoal: goal.id as any })}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 relative group",
                      formData.fitnessGoal === goal.id 
                        ? cn("border-border-light dark:border-border-dark shadow-glow", goal.bg)
                        : "border-border-light/40 dark:border-border-dark/40 opacity-50 hover:opacity-100 hover:border-border-light dark:hover:border-border-dark"
                    )}
                  >
                    {formData.fitnessGoal === goal.id && (
                      <motion.div layoutId="goal-active" className="absolute inset-0 border-2 border-primary-green rounded-2xl pointer-events-none" />
                    )}
                    <goal.icon size={24} className={cn("transition-transform group-hover:scale-110", goal.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-black flex items-center gap-2 px-1 uppercase tracking-tighter italic border-t border-border-light/40 dark:border-border-dark/40 pt-6">
                <Activity size={20} className="text-primary-green" /> Biometric Analysis
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1"><Ruler size={10} /> Height (cm)</label>
                  <input 
                    type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                    className="w-full elite-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1"><Activity size={10} /> Weight (kg)</label>
                  <input 
                    type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                    className="w-full elite-input"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Activity Level</label>
                  <select 
                     value={formData.activityLevel} onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                     className="w-full elite-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                  >
                     <option value="sedentary">Sedentary (Office job)</option>
                     <option value="light">Lightly Active (1-2 days/week)</option>
                     <option value="moderate">Moderately Active (3-5 days/week)</option>
                     <option value="active">Active (6-7 days/week)</option>
                     <option value="extra_active">Extra Active (Athlete)</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1"><Heart size={10} /> Daily Calorie Goal</label>
                     <button onClick={syncGoal} className="text-[10px] text-primary-green font-bold hover:underline">Calculate Suggested</button>
                  </div>
                  <input 
                    type="number" value={formData.calorieGoal} onChange={(e) => setFormData({...formData, calorieGoal: parseInt(e.target.value)})}
                    className="w-full elite-input font-bold text-lg text-primary-green"
                  />
                </div>
              </div>
            </div>
            
            <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full elite-button-primary flex items-center justify-center gap-2"
            >
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
           <div className="elite-card p-6 space-y-4">
              <h4 className="font-bold text-sm uppercase text-muted tracking-widest">Interface Theme</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'system', icon: Monitor, label: 'System' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                      theme === t.id 
                        ? "border-primary-green bg-primary-green/5 text-primary-green" 
                        : "border-border-light dark:border-border-dark text-muted hover:border-primary-green/30"
                    )}
                  >
                    <t.icon size={18} />
                    <span className="text-[10px] font-bold uppercase">{t.label}</span>
                  </button>
                ))}
              </div>
           </div>

           <div className="elite-card p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-danger-red/10 text-danger-red mx-auto flex items-center justify-center">
                 <ShieldAlert size={32} />
              </div>
              <div>
                <h4 className="font-bold text-main uppercase tracking-tighter italic">Account Security</h4>
                <p className="text-xs text-muted mt-1 uppercase font-bold tracking-widest opacity-60">Manage your connected account and preferences.</p>
              </div>
              <button 
                onClick={logout}
                className="w-full py-3 px-4 rounded-xl border border-danger-red/20 text-danger-red font-semibold text-sm hover:bg-danger-red hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sign out
              </button>
           </div>
           
            <div className="elite-card p-6 bg-primary-green/5 border-primary-green/10">
               <h4 className="font-bold text-primary-green text-sm uppercase mb-3">Health Insights</h4>
               <p className="text-xs leading-relaxed text-main font-medium">
                 Based on your metrics, your estimated BMR is <strong className="text-primary-green">{Math.round(10 * formData.weight + 6.25 * formData.height - 5 * 25 + 5)}</strong> kcal/day. 
                 Keep your {profile?.activityLevel} activity level to maintain your current progress.
               </p>
            </div>
        </div>
      </div>
    </div>
  );
}
