import React, { useEffect, useRef, useState } from 'react';
import { Alarm, AlarmSnoozeResponse } from '../../types';
import { api } from '../../api/client';

interface AlarmRingScreenProps {
  alarm: Alarm;
  userId: number;
  onDismiss: (action: string) => void;
  onStartNow: () => void;
  onNegotiate: (scheduleId?: number | null) => void;
}

export const AlarmRingScreen: React.FC<AlarmRingScreenProps> = ({
  alarm,
  userId,
  onDismiss,
  onStartNow,
  onNegotiate,
}) => {
  const [snoozing, setSnoozing] = useState<boolean>(false);
  const [snoozeWarning, setSnoozeWarning] = useState<AlarmSnoozeResponse | null>(null);
  const [negotiating, setNegotiating] = useState<boolean>(false);
  const [soundPlaying, setSoundPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.9); // Default loud volume (90%)

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorIntervalRef = useRef<number | null>(null);

  // High-Volume Web Audio Synthesizer with Dynamics Compressor (punchy & loud)
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Compressor to maximize loudness without clipping distortion
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);
      compressor.connect(ctx.destination);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(compressor);
      masterGainRef.current = masterGain;

      const playLoudAlarmPattern = () => {
        if (!soundPlaying || ctx.state === 'suspended') return;
        const now = ctx.currentTime;

        // Dual-Pulse Loud Alarm Beep (high clarity & penetration)
        const beeps = [0, 0.18, 0.36, 0.54];
        beeps.forEach((delay) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(880, now + delay); // A5 note

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1760, now + delay); // A6 overtone for piercing loudness

          noteGain.gain.setValueAtTime(0.85, now + delay);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

          osc1.connect(noteGain);
          osc2.connect(noteGain);
          noteGain.connect(masterGain);

          osc1.start(now + delay);
          osc1.stop(now + delay + 0.15);
          osc2.start(now + delay);
          osc2.stop(now + delay + 0.15);
        });
      };

      // Resume AudioContext if suspended by browser autoplay policy
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      playLoudAlarmPattern();
      const interval = window.setInterval(playLoudAlarmPattern, 1200); // Fast, urgent alarm cycle
      oscillatorIntervalRef.current = interval;
    } catch {
      // Audio autoplay fallback
    }

    return () => {
      if (oscillatorIntervalRef.current) clearInterval(oscillatorIntervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [soundPlaying, volume]);

  const updateVolume = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  const stopAudio = () => {
    setSoundPlaying(false);
    if (oscillatorIntervalRef.current) clearInterval(oscillatorIntervalRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
  };

  const handleSnooze = async () => {
    setSnoozing(true);
    try {
      const res = await api.snoozeAlarm(alarm.id, 10, userId);
      setSnoozeWarning(res);
      if (res.consequence_level === 'none') {
        stopAudio();
        setTimeout(() => onDismiss('snoozed'), 1200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSnoozing(false);
    }
  };

  const handleConfirmSnooze = () => {
    stopAudio();
    onDismiss('snoozed');
  };

  const handleNegotiateClick = async () => {
    setNegotiating(true);
    stopAudio();
    try {
      const res = await api.negotiateAlarm(alarm.id, userId);
      onNegotiate(res.schedule_id);
    } catch (err) {
      console.error(err);
      onNegotiate(alarm.schedule_id);
    } finally {
      setNegotiating(false);
    }
  };

  const handleStart = () => {
    stopAudio();
    onStartNow();
  };

  const handleDismissOnly = () => {
    stopAudio();
    onDismiss('dismissed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      {/* Pulsating background radar glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-96 h-96 rounded-full bg-indigo-600/20 animate-ping duration-1000" />
        <div className="w-[32rem] h-[32rem] rounded-full bg-purple-600/10 animate-pulse duration-700" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-8 text-center text-white z-10 flex flex-col items-center">
        {/* Animated Alarm Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 animate-bounce">
            <span className="text-4xl">⏰</span>
          </div>
          <div className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wide">
            {alarm.type === 'task_linked' ? 'Task Alert' : 'Circadian'}
          </div>
        </div>

        {/* Trigger Time & Label */}
        <div className="text-5xl font-black font-mono tracking-tight text-indigo-200 mb-2">
          {alarm.trigger_time}
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 leading-snug">
          {alarm.label}
        </h2>
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          {alarm.type === 'task_linked'
            ? 'Scheduled timeline session starting in 5 minutes. Ready to dive into deep work?'
            : 'Circadian rhythm marker. Align your body and focus for maximum retention.'}
        </p>

        {/* Consequence Alert if 2nd+ Snooze */}
        {snoozeWarning && snoozeWarning.consequence_level !== 'none' ? (
          <div className={`w-full p-4 mb-6 rounded-2xl border text-left animate-in slide-in-from-top-3 ${
            snoozeWarning.consequence_level === 'critical'
              ? 'bg-rose-950/60 border-rose-600/50 text-rose-200'
              : 'bg-amber-950/60 border-amber-600/50 text-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <span>⚠️ Consequence Warning (Snooze #{snoozeWarning.snooze_count})</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{snoozeWarning.consequence_message}</p>
            {snoozeWarning.subsequent_impact && (
              <div className="mt-2 text-xs font-medium text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                📉 {snoozeWarning.subsequent_impact}
              </div>
            )}
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={handleConfirmSnooze}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Snooze Anyway (+10m)
              </button>
              <button
                onClick={handleNegotiateClick}
                className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow"
              >
                Negotiate Slot with Sahay ⚖️
              </button>
            </div>
          </div>
        ) : (
          /* Primary Action Buttons */
          <div className="w-full space-y-3 mb-4">
            {/* 1. START NOW */}
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>🚀</span>
              <span>START NOW (FOCUS MODE)</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* 2. SNOOZE 10M */}
              <button
                onClick={handleSnooze}
                disabled={snoozing}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition hover:border-slate-500"
              >
                <span>⏳</span>
                <span>{snoozing ? 'Snoozing...' : 'Snooze 10m'}</span>
              </button>

              {/* 3. NEGOTIATE WITH SAHAY */}
              <button
                onClick={handleNegotiateClick}
                disabled={negotiating}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <span>⚖️</span>
                <span>{negotiating ? 'Opening...' : 'Negotiate'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loudness Booster & Controls */}
        <div className="w-full mt-2 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">📢 Alarm Volume</span>
              <span className="font-mono text-indigo-300 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateVolume(0.5)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  volume === 0.5 ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => updateVolume(0.9)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  volume === 0.9 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                Loud 🔥
              </button>
              <button
                onClick={() => updateVolume(1.0)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                  volume === 1.0 ? 'bg-rose-600 text-white font-bold animate-pulse' : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                MAX (100%) 🚨
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => setSoundPlaying(!soundPlaying)}
              className="hover:text-slate-300 transition flex items-center gap-1 font-semibold"
            >
              {soundPlaying ? '🔊 Sound Playing' : '🔇 Audio Paused'}
            </button>
            <button
              onClick={handleDismissOnly}
              className="hover:text-slate-300 transition underline underline-offset-4"
            >
              Dismiss for today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
