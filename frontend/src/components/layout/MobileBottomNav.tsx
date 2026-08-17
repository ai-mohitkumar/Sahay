import React from 'react';
import { Calendar, History, MessageSquareHeart, BookOpen, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'timeline' | 'simulation' | 'history' | 'pods' | 'coach' | 'study' | 'essentials' | 'alarms' | 'onboarding';
  setCurrentTab: (tab: 'timeline' | 'simulation' | 'history' | 'pods' | 'coach' | 'study' | 'essentials' | 'alarms' | 'onboarding') => void;
  onOpenProfileSwitcher?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenProfileSwitcher,
}) => {
  if (currentTab === 'onboarding') return null;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-1 py-1 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
      {/* 1. 24h Flow */}
      <button
        type="button"
        onClick={() => setCurrentTab('timeline')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
          currentTab === 'timeline'
            ? 'text-purple-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight">Flow</span>
      </button>

      {/* 2. Stats / Ledger */}
      <button
        type="button"
        onClick={() => setCurrentTab('history')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
          currentTab === 'history'
            ? 'text-indigo-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <History className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight">Stats</span>
      </button>

      {/* 3. Coach Letter */}
      <button
        type="button"
        onClick={() => setCurrentTab('coach')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
          currentTab === 'coach'
            ? 'text-purple-300 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MessageSquareHeart className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight">Coach</span>
      </button>

      {/* 4. Study & Tutor */}
      <button
        type="button"
        onClick={() => setCurrentTab('study')}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
          currentTab === 'study'
            ? 'text-blue-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight">Study</span>
      </button>

      {/* 5. Life Essentials / Switcher */}
      <button
        type="button"
        onClick={() => {
          if (currentTab === 'essentials') {
            if (onOpenProfileSwitcher) onOpenProfileSwitcher();
          } else {
            setCurrentTab('essentials');
          }
        }}
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
          currentTab === 'essentials'
            ? 'text-teal-400 font-extrabold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 tracking-tight">Vault</span>
      </button>
    </div>
  );
};
