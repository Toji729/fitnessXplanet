import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, X, ChevronDown, Check, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

const foodDatabase = [
  // --- Standard/Western ---
  { name: 'Oatmeal', cal: 150, p: 5, c: 27, f: 3, cat: 'Breakfast' },
  { name: 'Chicken Breast (Grilled)', cal: 165, p: 31, c: 0, f: 3.6, cat: 'Lunch' },
  { name: 'Avocado', cal: 160, p: 2, c: 9, f: 15, cat: 'Snack' },
  { name: 'Greek Yogurt', cal: 100, p: 10, c: 4, f: 0, cat: 'Breakfast' },
  { name: 'Salmon', cal: 208, p: 20, c: 0, f: 13, cat: 'Dinner' },
  { name: 'Brown Rice', cal: 111, p: 2.6, c: 23, f: 0.9, cat: 'Lunch' },
  { name: 'Apple', cal: 52, p: 0.3, c: 14, f: 0.2, cat: 'Snack' },
  { name: 'Almonds', cal: 579, p: 21, c: 22, f: 50, cat: 'Snack' },

  // --- Indian Meals ---
  { name: 'Paneer Tikka', cal: 240, p: 14, c: 8, f: 18, cat: 'Lunch' },
  { name: 'Butter Chicken', cal: 260, p: 16, c: 9, f: 19, cat: 'Dinner' },
  { name: 'Dal Makhani', cal: 130, p: 5, c: 15, f: 6, cat: 'Dinner' },
  { name: 'Chana Masala', cal: 164, p: 7, c: 22, f: 4, cat: 'Lunch' },
  { name: 'Palak Paneer', cal: 180, p: 9, c: 7, f: 14, cat: 'Dinner' },
  { name: 'Biryani (Chicken)', cal: 150, p: 12, c: 18, f: 4, cat: 'Lunch' },
  { name: 'Masala Dosa', cal: 170, p: 4, c: 28, f: 5, cat: 'Breakfast' },
  { name: 'Roti / Chapati', cal: 297, p: 10, c: 60, f: 1.5, cat: 'Lunch' },
  { name: 'Samosa (1 piece)', cal: 260, p: 4, c: 32, f: 14, cat: 'Snack' },
  { name: 'Gulab Jamun (1 piece)', cal: 150, p: 2, c: 25, f: 6, cat: 'Dessert' },

  // --- Chinese Meals ---
  { name: 'Kung Pao Chicken', cal: 130, p: 11, c: 5, f: 7, cat: 'Dinner' },
  { name: 'Dim Sum (Siu Mai)', cal: 180, p: 8, c: 14, f: 11, cat: 'Snack' },
  { name: 'Chow Mein', cal: 125, p: 3, c: 18, f: 5, cat: 'Lunch' },
  { name: 'Sweet and Sour Pork', cal: 230, p: 10, c: 25, f: 10, cat: 'Dinner' },
  { name: 'Hot and Sour Soup', cal: 40, p: 2, c: 5, f: 1.5, cat: 'Appetizer' },
  { name: 'Wontons (Clear Soup)', cal: 50, p: 3, c: 6, f: 1.5, cat: 'Lunch' },
  { name: 'Mapo Tofu', cal: 105, p: 8, c: 5, f: 6, cat: 'Dinner' },
  { name: 'Spring Rolls', cal: 210, p: 5, c: 24, f: 11, cat: 'Snack' },
  { name: 'Bao (Steamed Pork)', cal: 220, p: 9, c: 30, f: 6, cat: 'Lunch' },

  // --- Korean Meals ---
  { name: 'Bibimbap', cal: 160, p: 6, c: 25, f: 4, cat: 'Lunch' },
  { name: 'Bulgogi (Beef)', cal: 190, p: 18, c: 11, f: 8, cat: 'Dinner' },
  { name: 'Kimchi', cal: 15, p: 1, c: 2, f: 0.1, cat: 'Side' },
  { name: 'Kimchi Jjigae (Stew)', cal: 70, p: 5, c: 4, f: 4, cat: 'Dinner' },
  { name: 'Tteokbokki', cal: 200, p: 4, c: 40, f: 1.5, cat: 'Snack' },
  { name: 'Japchae (Glass Noodles)', cal: 140, p: 3, c: 28, f: 3, cat: 'Lunch' },
  { name: 'Kimbap', cal: 145, p: 4, c: 26, f: 3, cat: 'Lunch' },
  { name: 'Korean Fried Chicken', cal: 290, p: 15, c: 15, f: 18, cat: 'Dinner' },
  { name: 'Samgyeopsal (Pork Belly)', cal: 518, p: 15, c: 0, f: 52, cat: 'Dinner' },
  { name: 'Mandu (Dumplings)', cal: 200, p: 10, c: 22, f: 8, cat: 'Snack' },
];

export default function LogMeal() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('breakfast');

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = foodDatabase.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'meals'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (s) => setMeals(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  const addMeal = async () => {
    if (!user || !selectedFood) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'meals'), {
        foodName: selectedFood.name,
        calories: Math.round(selectedFood.cal * servings),
        protein: Math.round(selectedFood.p * servings),
        carbs: Math.round(selectedFood.c * servings),
        fat: Math.round(selectedFood.f * servings),
        mealType,
        timestamp: new Date().toISOString()
      });
      setSelectedFood(null);
      setSearchTerm('');
      setServings(1); // Reset servings
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  const deleteMeal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'meals', id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Search HUD */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
           <div className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse" />
           <label className="text-[10px] font-black uppercase text-primary-green tracking-[0.4em]">Nutritional Lookup Interface</label>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="text-primary-green opacity-50 group-focus-within:opacity-100 transition-opacity" size={20} />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="ACCESS GLOBAL FOOD DATABASE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-card-dark/40 backdrop-blur-xl border-2 border-border-light dark:border-border-dark rounded-[24px] pl-14 pr-12 py-6 text-xl font-black uppercase tracking-widest focus:outline-none focus:border-primary-green transition-all"
          />
          {searchTerm && (
             <button 
               onClick={() => setSearchTerm('')}
               className="absolute inset-y-0 right-5 flex items-center text-muted hover:text-danger-red transition-colors"
             >
               <X size={20} />
             </button>
          )}
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-4 z-50 elite-card border-primary-green/30 futuristic-glow overflow-hidden shadow-2xl"
            >
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {results.map((food, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFood(food)}
                    className="w-full flex items-center justify-between p-6 hover:bg-primary-green/5 border-b border-border-light dark:border-border-dark last:border-0 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-black text-lg tracking-tight uppercase group-hover:text-primary-green transition-colors italic">{food.name}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[10px] bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-md font-black uppercase tracking-widest">{food.cat}</span>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-60">
                           P:{food.p}G / C:{food.c}G / F:{food.f}G
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-2xl text-primary-green tracking-tighter tabular-nums">{food.cal}</p>
                       <p className="text-[8px] font-black uppercase text-muted tracking-widest opacity-40">Unit Energy</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Entry Modal - Tactical HUD Style */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedFood(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md" 
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 40 }}
               className="elite-card w-full max-w-xl p-0 relative overflow-hidden futuristic-glow scanline-overlay"
             >
               <div className="absolute top-0 right-0 p-6 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-green" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-green opacity-40" />
               </div>
               
               <div className="p-8 space-y-8">
                 <div className="text-center">
                   <h2 className="text-4xl font-black tracking-tighter uppercase italic text-main">{selectedFood.name}</h2>
                   <p className="text-muted font-black text-[10px] uppercase tracking-[0.4em] mt-2 opacity-50">Data Extraction: 100G Standard Reference</p>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                   {[
                     { label: 'Protien', val: Math.round(selectedFood.p * servings), color: 'text-primary-green', bg: 'bg-primary-green' },
                     { label: 'Carbs', val: Math.round(selectedFood.c * servings), color: 'text-blue-500', bg: 'bg-blue-500' },
                     { label: 'Lipids', val: Math.round(selectedFood.f * servings), color: 'text-accent-amber', bg: 'bg-accent-amber' },
                   ].map((macro, i) => (
                     <div key={i} className={cn("p-5 rounded-[24px] border border-border-light dark:border-border-dark flex flex-col items-center gap-1", macro.bg + "/5")}>
                       <p className="text-[10px] text-muted uppercase font-black tracking-widest">{macro.label}</p>
                       <p className={cn("text-2xl font-black tabular-nums", macro.color)}>{macro.val}<span className="text-[10px] opacity-40 inline-block ml-0.5">G</span></p>
                     </div>
                   ))}
                 </div>

                 <div className="space-y-6 bg-bg-light dark:bg-bg-dark/40 p-6 rounded-[24px]">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-black uppercase tracking-[0.2em]">Quantity Factor</label>
                     <span className="text-xl font-black tabular-nums">{servings} × 100G</span>
                   </div>
                   <input 
                     type="range" min="0.5" max="10" step="0.5" 
                     value={servings} onChange={(e) => setServings(parseFloat(e.target.value))}
                     className="w-full h-1.5 bg-border-light dark:bg-border-dark rounded-full appearance-none accent-primary-green cursor-pointer"
                   />
                   
                   <div className="grid grid-cols-4 gap-2">
                     {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                       <button
                         key={type}
                         onClick={() => setMealType(type)}
                         className={cn(
                           "py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                           mealType === type 
                             ? "bg-primary-green text-white shadow-glow translate-y-[-2px]" 
                             : "bg-white dark:bg-card-dark text-muted border border-border-light dark:border-border-dark hover:border-primary-green/50"
                         )}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="flex-1 py-5 border-2 border-border-light dark:border-border-dark rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-danger-red/5 hover:text-danger-red hover:border-danger-red transition-all"
                    >
                      Abort
                    </button>
                    <button
                      onClick={addMeal}
                      className="flex-[2] py-5 bg-primary-green text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-button hover:shadow-glow transition-all active:scale-95"
                    >
                      Commit Log: {Math.round(selectedFood.cal * servings)} kcal
                    </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Timeline - Operations Style */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-6 bg-primary-green rounded-full shadow-[0_0_8px_rgba(29,158,117,1)]" />
           <h3 className="text-xl font-black tracking-tight uppercase italic">Operational Cycle History</h3>
        </div>
        
        <div className="relative pl-10 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-border-light/40 dark:before:bg-border-dark/40 before:border-l-2 before:border-dotted">
          {meals.length === 0 ? (
            <div className="elite-card py-20 text-center opacity-20 -ml-10">
               <Utensils size={64} className="mx-auto mb-6" />
               <p className="font-black text-xs uppercase tracking-[0.4em]">Sector Clear / Waiting for Input</p>
            </div>
          ) : (
            meals.map((meal, i) => (
              <motion.div 
                key={meal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group lg:pr-20"
              >
                <div className={cn(
                  "absolute -left-[39px] top-6 w-4 h-4 rounded-full border-4 border-bg-light dark:border-bg-dark z-10 group-hover:scale-125 transition-transform",
                  meal.mealType === 'breakfast' ? 'bg-primary-green shadow-[0_0_8px_rgba(29,158,117,1)]' : 
                  meal.mealType === 'lunch' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]' : 
                  meal.mealType === 'snack' ? 'bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,1)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,1)]'
                )} />
                <div className="elite-card px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-glow transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em]">{meal.mealType}</p>
                       <div className="h-0.5 w-4 bg-border-light dark:bg-border-dark" />
                       <p className="text-[9px] font-black text-primary-green uppercase tracking-[0.3em]">Status: Committed</p>
                    </div>
                    <h4 className="font-black text-xl tracking-tighter uppercase italic text-main group-hover:text-primary-green transition-colors">{meal.foodName}</h4>
                    <div className="flex gap-4 mt-3">
                       {[
                         { label: 'P', val: meal.protein, color: 'text-primary-green' },
                         { label: 'C', val: meal.carbs, color: 'text-blue-500' },
                         { label: 'F', val: meal.fat, color: 'text-accent-amber' },
                       ].map(m => (
                         <span key={m.label} className="text-[10px] font-bold uppercase tracking-widest">
                           <span className={m.color}>{m.label}:</span> <span className="opacity-60 tabular-nums">{m.val}G</span>
                         </span>
                       ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-border-light dark:border-border-dark pt-4 md:pt-0 md:pl-8">
                    <div className="text-right">
                      <p className="text-3xl font-black tabular-nums tracking-tighter">{meal.calories}</p>
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest opacity-40 italic">Energy Yield</p>
                    </div>
                    <button 
                       onClick={() => deleteMeal(meal.id)}
                       className="p-3 bg-danger-red/10 text-danger-red rounded-xl hover:bg-danger-red hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
