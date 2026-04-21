import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format, subDays } from 'date-fns';
import { Activity, Target, Waves } from 'lucide-react';

export default function Analytics() {
  const { user, profile } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [waterData, _setWaterData] = useState<any[]>([
    { day: 'Mon', glasses: 6 },
    { day: 'Tue', glasses: 8 },
    { day: 'Wed', glasses: 7 },
    { day: 'Thu', glasses: 5 },
    { day: 'Fri', glasses: 9 },
    { day: 'Sat', glasses: 4 },
    { day: 'Sun', glasses: 8 },
  ]);

  useEffect(() => {
    if (!user) return;
    const sevenDaysAgo = subDays(new Date(), 7);
    const q = query(
      collection(db, 'users', user.uid, 'meals'),
      where('timestamp', '>=', sevenDaysAgo.toISOString()),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const dailyMap: any = {};
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM d');
        dailyMap[date] = 0;
      }
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = format(new Date(data.timestamp), 'MMM d');
        if (dailyMap[date] !== undefined) dailyMap[date] += data.calories || 0;
      });
      setChartData(Object.keys(dailyMap).map(day => ({ day, calories: dailyMap[day] })));
    });
    return unsub;
  }, [user]);

  const bmi = profile ? Math.round((profile.weight / Math.pow(profile.height / 100, 2)) * 10) / 10 : 0;
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="elite-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Current Status</h3>
            <p className="text-2xl font-bold">Body Mass Index</p>
          </div>
          <div className="flex items-center justify-between my-4">
             <div className="text-5xl font-black text-primary-green tracking-tighter">{bmi}</div>
             <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${bmiCategory === 'Normal' ? 'bg-primary-green/10 text-primary-green' : 'bg-accent-amber/10 text-accent-amber'}`}>
               {bmiCategory}
             </span>
          </div>
          <div className="h-1.5 w-full bg-border-light dark:bg-border-dark rounded-full overflow-hidden flex">
             <div className="h-full bg-blue-400 w-[20%]" /><div className="h-full bg-primary-green w-[30%]" /><div className="h-full bg-accent-amber w-[30%]" /><div className="h-full bg-danger-red w-[20%]" />
          </div>
        </div>
        <div className="elite-card p-6 col-span-1 lg:col-span-2 flex items-center gap-6">
           <div className="flex-1 space-y-4">
             <h3 className="font-bold text-lg flex items-center gap-2"><Activity size={20} className="text-primary-green" /> Vital Stats</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[10px] text-muted font-bold uppercase">Average Calories</p>
                 <p className="text-xl font-bold">1,840 <span className="text-xs text-muted font-normal">kcal</span></p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] text-muted font-bold uppercase">Weekly Loss/Gain</p>
                 <p className="text-xl font-bold text-primary-green">-0.4 <span className="text-xs text-muted font-normal">kg</span></p>
               </div>
             </div>
           </div>
           <div className="w-px h-24 bg-border-light dark:bg-border-dark hidden sm:block" />
           <div className="hidden sm:block flex-1 space-y-4">
             <h3 className="font-bold text-lg flex items-center gap-2"><Target size={20} className="text-accent-amber" /> Habit Sync</h3>
             <div className="flex gap-2">
                {[70, 85, 45, 90].map((v, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-lg bg-bg-light dark:bg-bg-dark border border-border-light flex items-center justify-center">
                       <span className="text-[10px] font-bold">{v}%</span>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
      <div className="elite-card p-6">
        <div className="flex items-center justify-between mb-8">
           <div><h3 className="font-bold text-xl">Caloric Intake</h3><p className="text-xs text-muted">Last 7 days</p></div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary-green shadow-button" /><span className="text-[10px] font-bold text-muted uppercase">Calories</span></div>
        </div>
        <div className="h-72 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="calories" stroke="#1D9E75" strokeWidth={4} dot={{ r: 4, fill: '#1D9E75', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#0F6E56' }} animationDuration={1500} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>
      <div className="elite-card p-6">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Waves size={20} /></div>
           <div><h3 className="font-bold text-xl">Hydration Cycles</h3><p className="text-xs text-muted">Weekly view</p></div>
        </div>
        <div className="h-60 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={waterData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="glasses" radius={[6, 6, 0, 0]}>
                   {waterData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.glasses >= 8 ? '#3B82F6' : '#93C5FD'} />)}
                </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
