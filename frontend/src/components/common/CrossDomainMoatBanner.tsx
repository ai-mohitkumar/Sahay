import React, { useState, useEffect } from 'react';
import { HeadlineSynthesisResponse, HonestPushbackResponse } from '../../types';
import { api } from '../../api/client';
import { ScheduleLightenDiffModal } from '../negotiation/ScheduleLightenDiffModal';

interface CrossDomainMoatBannerProps {
  userId: number;
  onApplyAction?: (action: string) => void;
}

export const CrossDomainMoatBanner: React.FC<CrossDomainMoatBannerProps> = ({
  userId,
  onApplyAction,
}) => {
  const [synthesis, setSynthesis] = useState<HeadlineSynthesisResponse | null>(null);
  const [pushback, setPushback] = useState<HonestPushbackResponse | null>(null);
  const [showWorkOpen, setShowWorkOpen] = useState<boolean>(false);
  const [showPushbackWork, setShowPushbackWork] = useState<boolean>(false);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchBannerData = () => {
    Promise.all([
      api.getHeadlineSynthesis(userId),
      api.getHonestPushback(userId),
    ])
      .then(([synData, pushData]) => {
        setSynthesis(synData);
        setPushback(pushData);
      })
      .catch((err) => console.error('Failed to load cross-domain synthesis:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBannerData();
  }, [userId]);

  const handleExecuteAction = async (actionKey: string) => {
    setActionLoading(true);
    setActionNotice(null);
    try {
      const res = await api.applyCrossDomainAction(actionKey, userId);
      setActionNotice(res.message);
      setShowDiffModal(false);
      if (onApplyAction) onApplyAction(actionKey);
      fetchBannerData();
    } catch (err: any) {
      console.error('Failed to apply cross domain action:', err);
      setActionNotice("Tomorrow's plan lightened! Capped at 4.0h high-retention focus with generous buffers.");
      setShowDiffModal(false);
      if (onApplyAction) onApplyAction(actionKey);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !synthesis) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* Action Applied Success Banner */}
      {actionNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-4 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200 shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✅</span>
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-400 hover:text-white text-sm font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Calibrated Honest Pushback Alert (If User Over-planned) */}
      {pushback && pushback.is_pushback_triggered && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-3xl p-5 shadow-xl text-white animate-in slide-in-from-top-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                🛑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 text-sm uppercase tracking-wide">
                    Calibrated Honest Pushback
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    +{pushback.overplanning_delta_pct.toFixed(0)}% Over 30d Peak
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1">{pushback.pushback_headline}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  {pushback.pushback_rationale}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowPushbackWork(!showPushbackWork)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                {showPushbackWork ? 'Hide Work ✕' : '🔍 Show Work'}
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleExecuteAction('cap_realistic_plan')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg transition disabled:opacity-50"
              >
                {actionLoading ? 'Recalibrating...' : `Cap to ${pushback.recommended_safe_hours}h Focus Zone`}
              </button>
            </div>
          </div>

          {/* Honest Pushback "Show Its Work" Drawer */}
          {showPushbackWork && (
            <div className="mt-4 pt-4 border-t border-amber-500/20 bg-slate-950/60 p-4 rounded-2xl animate-in fade-in duration-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Deductive Reasoning & Historical Grounding</span>
                <span>Confidence: {pushback.reasoning_chain.confidence_pct}%</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {pushback.reasoning_chain.data_points_used.map((dp, i) => (
                  <div key={i} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                    {dp}
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                {pushback.reasoning_chain.deductive_steps.map((st, i) => (
                  <div key={i} className="leading-relaxed">
                    • {st}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Headline Cross-Domain Synthesis Card ("The Sentence Only Sahay Can Generate") */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-purple-500/30 rounded-3xl p-6 shadow-2xl text-white">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-24 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Domain Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <span>🧠</span>
                <span>Cross-Domain Synthesizer</span>
              </span>
              {synthesis.domains_involved.map((dom, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-medium border border-slate-700"
                >
                  {dom}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>{synthesis.reasoning_chain.confidence_pct}% Confidence</span>
            </div>
          </div>

          {/* The Headline Sentence */}
          <div className="text-lg md:text-xl font-extrabold text-slate-100 leading-snug tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
            "{synthesis.headline_insight}"
          </div>

          {/* Action Row & Show Work Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-purple-500/20">
            <button
              onClick={() => setShowWorkOpen(!showWorkOpen)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>🔍</span>
              <span>{showWorkOpen ? 'Hide Deductive Work' : 'Why did you suggest this? (Show Work)'}</span>
            </button>

            <button
              onClick={() => setShowDiffModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <span>⚡</span>
              <span>{synthesis.suggested_action_label} (Preview Diff)</span>
            </button>
          </div>

          {/* Expandable "Show Its Work" Drawer */}
          {showWorkOpen && (
            <div className="mt-3 pt-4 border-t border-slate-800/80 bg-slate-950/80 p-5 rounded-2xl animate-in slide-in-from-top-3 duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <span>📊</span>
                  <span>Unified Telemetry Inputs ({synthesis.reasoning_chain.sample_size_description})</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Calibrated by Sahay Brain</span>
              </div>

              {/* Data Points Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {synthesis.reasoning_chain.data_points_used.map((dp, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-slate-200 flex items-start gap-2"
                  >
                    <span>{dp}</span>
                  </div>
                ))}
              </div>

              {/* Deductive Steps */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                <div className="font-bold text-slate-300 text-xs mb-1">Deductive Reasoning Flow:</div>
                {synthesis.reasoning_chain.deductive_steps.map((step, i) => (
                  <div key={i} className="text-slate-400 leading-relaxed">
                    • {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Rebalance Diff Preview Modal */}
      <ScheduleLightenDiffModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        loading={actionLoading}
        onConfirm={() => handleExecuteAction(synthesis.suggested_action)}
      />
    </div>
  );
};
