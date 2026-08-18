import React from 'react';
import {
  BrainCircuit,
  Play,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HomeLandingScreenProps {
  onEnterApp: () => void;
  onSelectPreset: (presetKey: string) => void;
  onOpenHowItWorks: () => void;
  activeUserName?: string;
  activeExamName?: string;
}

export const HomeLandingScreen: React.FC<HomeLandingScreenProps> = ({
  onEnterApp,
  onSelectPreset,
  onOpenHowItWorks,
  activeUserName,
  activeExamName,
}) => {
  const { isInstalled, installApp } = usePWAInstall();

  const presets = [
    {
      key: 'gate_cse',
      title: 'GATE CSE 2027',
      avatar: '🎓',
      color: 'from-blue-600 to-indigo-600',
      border: 'border-blue-500/40',
      desc: 'OS, DSA, CN, Engineering Maths • 182d Runway',
    },
    {
      key: 'cat_mba',
      title: 'CAT 2026 MBA',
      avatar: '📈',
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-500/40',
      desc: 'Quant, DILR, VARC • 99.2% Target • 90d Runway',
    },
    {
      key: 'upsc_civil',
      title: 'UPSC CSE 2027',
      avatar: '🏛️',
      color: 'from-purple-600 to-pink-600',
      border: 'border-purple-500/40',
      desc: 'Polity, Modern History, Economy, CSAT',
    },
    {
      key: 'sem_dsa',
      title: 'DSA + Semester',
      avatar: '💻',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/40',
      desc: 'LeetCode DSA, DBMS, System Design • 60d Sprint',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 relative z-10 w-full space-y-10">
        
        {/* Top App Header / Install Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/40 border border-purple-400/30">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                Sahay
              </span>
              <span className="text-[10px] ml-1.5 font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                PWA Mobile
              </span>
            </div>
          </div>

          {/* Download / Install App Button */}
          <button
            onClick={installApp}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-lg active:scale-95 group"
          >
            <Smartphone className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>{isInstalled ? 'App Installed ✓' : 'Install on Phone 📲'}</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>The Reality Recovery Engine • Not another static calendar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Google Calendar tells you what’s scheduled.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Sahay tells you what to do when reality breaks it.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            When college over-runs, low energy hits, or deadlines shift, Sahay doesn't let you abandon your day. It actively bargains trade-offs, protects your sleep floor, and keeps your exam runway intact.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter 24h Flow</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://github.com/ai-mohitkumar/Sahay/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95"
            >
              <span>📦</span>
              <span>Download Android APK</span>
            </a>

            <button
              onClick={onOpenHowItWorks}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2"
            >
              <span>📐 How Sahay Thinks</span>
            </button>
          </div>

          {activeUserName && (
            <div className="pt-2 text-xs text-slate-400">
              Active Persona:{' '}
              <strong className="text-purple-300 font-semibold">{activeUserName}</strong>{' '}
              {activeExamName && <span>({activeExamName})</span>}
            </div>
          )}
        </div>

        {/* 1-Click Persona Quick Launchers */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span>
              <span>1-Click Student Persona Starters</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Instant Calibration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((p) => (
              <button
                key={p.key}
                onClick={() => onSelectPreset(p.key)}
                className={`text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border ${p.border} transition-all hover:scale-[1.01] active:scale-98 shadow-md flex items-start space-x-3.5 group`}
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
                  {p.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition">
                      {p.title}
                    </h4>
                    <span className="text-xs text-slate-500 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Core Moat Pillars Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-300 text-sm">
              🤝
            </div>
            <h5 className="text-xs font-bold text-slate-200">Trade-Off Engine</h5>
            <p className="text-[10px] text-slate-400">Micro-bargaining & honest counter-offers</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-300 text-sm">
              🛑
            </div>
            <h5 className="text-xs font-bold text-slate-200">Capacity Reality Check</h5>
            <p className="text-[10px] text-slate-400">Pushes back on 13h over-planning</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-300 text-sm">
              🪞
            </div>
            <h5 className="text-xs font-bold text-slate-200">Confession Mode</h5>
            <p className="text-[10px] text-slate-400">Zero-judgment weekly self-awareness</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-300 text-sm">
              🌙
            </div>
            <h5 className="text-xs font-bold text-slate-200">Circadian Sync</h5>
            <p className="text-[10px] text-slate-400">Protects sleep floor & focus peaks</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local SQLite • Deterministic Logic • Zero Third-Party Leaks</span>
          </div>
          <span>MIT License • Built for Serious Aspirants</span>
        </div>
      </div>
    </div>
  );
};
