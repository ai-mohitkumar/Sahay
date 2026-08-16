import { useState, useEffect } from 'react';
import { Moon, Heart, Wind, Activity, BatteryCharging } from 'lucide-react';
import { HealthEnergyLog } from '../../types';

interface HealthEnergyViewProps {
  health: HealthEnergyLog;
}

export const HealthEnergyView: React.FC<HealthEnergyViewProps> = ({ health }) => {
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [timer, setTimer] = useState<number>(120);

  useEffect(() => {
    let interval: any;
    if (breathingActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        const cycle = timer % 16;
        if (cycle > 12) setBreathPhase('Inhale');
        else if (cycle > 8) setBreathPhase('Hold');
        else if (cycle > 4) setBreathPhase('Exhale');
        else setBreathPhase('Rest');
      }, 1000);
    } else if (timer === 0) {
      setBreathingActive(false);
    }
    return () => clearInterval(interval);
  }, [breathingActive, timer]);

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Moon className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Circadian Sleep Average
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{health.sleep_hours} hrs</p>
          <span className="text-xs text-emerald-400 font-semibold mt-1 block">
            Quality: {health.sleep_quality}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-center space-x-2 text-amber-400">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cognitive Energy Score
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{health.energy_level} / 5</p>
          <span className="text-xs text-slate-400 mt-1 block">Optimal for 8:30 PM deep focus</span>
        </div>

        <div className="bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-500/30 rounded-2xl p-5 shadow-md">
          <div className="flex items-center space-x-2 text-teal-400">
            <BatteryCharging className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
              Stress & Recovery Mode
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {health.recovery_mode_active ? 'Recovery Active' : 'Low Fatigue'}
          </p>
          <span className="text-xs text-slate-300 mt-1 block">
            Stress index: {Math.round(health.stress_score * 100)}%
          </span>
        </div>
      </div>

      {/* Peer Empathy Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-5 flex items-start space-x-3.5 shadow-lg">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
          <Heart className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-0.5">
            Anonymous Peer Empathy Benchmark
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            "{health.peer_empathy_note}"
          </p>
        </div>
      </div>

      {/* 2-Minute Box Breathing Reset */}
      <div className="bg-navy-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
        <div className="max-w-md mx-auto space-y-1">
          <h4 className="text-base font-extrabold text-white flex items-center justify-center space-x-2">
            <Wind className="w-5 h-5 text-teal-400" />
            <span>2-Minute Box Breathing Reset</span>
          </h4>
          <p className="text-xs text-slate-400">
            Quick 4-4-4-4 parasympathetic reset to lower exam anxiety before study blocks.
          </p>
        </div>

        {breathingActive ? (
          <div className="py-8 space-y-4 animate-fadeIn">
            <div className="w-32 h-32 mx-auto rounded-full bg-teal-500/20 border-2 border-teal-400/60 flex flex-col items-center justify-center animate-pulse">
              <span className="text-xl font-black text-white">{breathPhase}</span>
              <span className="text-xs font-mono text-teal-300 mt-1">{timer}s left</span>
            </div>

            <button
              onClick={() => setBreathingActive(false)}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Stop Session
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={() => {
                setTimer(120);
                setBreathingActive(true);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Start 2-Min Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
