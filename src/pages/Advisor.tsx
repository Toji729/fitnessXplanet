import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Leaf, User, Sparkles } from 'lucide-react';
import { getNutritionAdvice } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const quickChips = [
    "Predict my calories needed",
    "Healthy breakfast ideas",
    "Post-workout snacks",
    "How to reduce sugar?",
    "Best source of protein?"
];

export default function Advisor() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: `Hello ${profile?.name?.split(' ')[0] || 'there'}! I'm your NutriSense AI Advisor. How can I help you optimize your nutrition today?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    history.push({ role: 'user', text });

    const advice = await getNutritionAdvice(history, profile);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: advice || '' }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      <div className="elite-card flex-1 flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-bg-light/30 dark:bg-bg-dark/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green relative">
               <Leaf size={20} />
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-green rounded-full border-2 border-white dark:border-card-dark animate-pulse" />
            </div>
            <div>
              <p className="font-bold">NutriSense AI</p>
              <p className="text-[10px] text-primary-green font-bold uppercase tracking-wider">Online & Expert</p>
            </div>
          </div>
          <Sparkles className="text-accent-amber" size={20} />
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-primary-green text-white' : 'bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-primary-green shadow-sm'}`}>
                  {m.role === 'user' ? <User size={14} /> : <Leaf size={14} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-primary-green text-white rounded-tr-none shadow-button' 
                    : 'bg-white dark:bg-card-dark text-[#0F1C18] dark:text-[#F0FDF4] rounded-tl-none border border-border-light dark:border-border-dark shadow-card'
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-card-dark p-4 rounded-2xl rounded-tl-none border border-border-light dark:border-border-dark flex gap-1">
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-primary-green rounded-full" />
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary-green rounded-full" />
                 <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary-green rounded-full" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-card-dark border-t border-border-light dark:border-border-dark">
           {/* Quick Chips */}
           <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {quickChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-border-light dark:border-border-dark text-xs font-medium hover:border-primary-green hover:text-primary-green transition-all"
                >
                  {chip}
                </button>
              ))}
           </div>

           <div className="relative">
              <input
                type="text"
                placeholder="Ask your advisor anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
                className="w-full elite-input pr-14 py-4"
              />
              <button
                disabled={!input.trim()}
                onClick={() => handleSend(input)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${input.trim() ? 'bg-primary-green text-white shadow-sm scale-110' : 'text-muted'}`}
              >
                <Send size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
