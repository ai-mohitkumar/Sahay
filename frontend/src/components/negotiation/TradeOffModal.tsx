import { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Split,
  Calendar,
  ArrowRight,
  Sliders,
  Flame,
  BrainCircuit,
  Info
} from 'lucide-react';
import { NegotiationEvaluation } from '../../types';

interface TradeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: NegotiationEvaluation | null;
  loading: boolean;
  onAcceptProposal: (proposalId: string, customDurationMins?: number, reason?: string) => void;
}

export const TradeOffModal: React.FC<TradeOffModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  loading,
  onAcceptProposal,
}) => {
  const [selectedProposalId, setSelectedProposalId] = useState<string>('shift_tonight');
  const [reason, setReason] = useState<string>('tired');
  const [bargainMinutes, setBargainMinutes] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<'trades' | 'micro_bargain'>('trades');

  if (!isOpen || !evaluation) return null;

  const getProposalIcon = (type: string) => {
    switch (type) {
      case 'reschedule_today':
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'split_next_day':
        return <Split className="w-4 h-4 text-purple-400" />;
      case 'micro_duration':
        return <Sliders className="w-4 h-4 text-emerald-400" />;
      case 'weekend_swap':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  // Dynamic live calculation for micro-negotiation slider
  const sliderReadinessGain = Math.min(3.8, Math.round((bargainMinutes / 90) * 3.8 * 10) / 10);
  const sliderReadinessAfter = Math.max(10, Math.round((evaluation.readiness_before_pct - (3.8 - sliderReadinessGain)) * 10) / 10);
  const sliderDebtSaved = 90 - bargainMinutes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Confidence & Stress indicators */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <BrainCircuit className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Sahay Trade-Off Engine
                </h3>
                {/* 1. Confidence Calibrated Badge */}
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{evaluation.ai_confidence_level}</span>
                </span>
                {/* 6. Stress Mode indicator */}
                {evaluation.is_stress_mode_active && (
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-500/30">
                    Humane Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                A thinking partner that negotiates real stakes with you.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* 2. Cost of the conversation (Transparency) */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] block mb-0.5">
                Why I'm stepping in:
              </span>
              <p className="leading-relaxed">{evaluation.interruption_rationale}</p>
            </div>
          </div>

          {/* 3. Regret Ledger Habit Breaker (if previously postponed) */}
          {evaluation.regret_ledger_insight && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-200">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-0.5">
                  Regret Ledger Pattern Detected:
                </span>
                <p className="leading-relaxed">{evaluation.regret_ledger_insight}</p>
              </div>
            </div>
          )}

          {/* AI Calibrated Voice Observation Note */}
          <div className="text-xs text-slate-400 italic bg-navy-950/70 p-3 rounded-xl border border-slate-800/80">
            "{evaluation.confidence_voice_note}"
          </div>

          {/* Reason Selector */}
          <div className="flex items-center justify-between bg-navy-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Why can't you do this right now?</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
            >
              <option value="tired">Low Energy / Tired</option>
              <option value="emergency">Urgent College / Work Task</option>
              <option value="procrastination">Mental Resistance / Overwhelmed</option>
              <option value="social">Family / Social Commitment</option>
            </select>
          </div>

          {/* Consequence Narrative & Metrics */}
          <div className="bg-gradient-to-br from-slate-950 to-indigo-950/30 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                "{evaluation.consequence_narrative}"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Subject Readiness</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-xs font-semibold text-slate-300 line-through">
                    {evaluation.readiness_before_pct}%
                  </span>
                  <ArrowRight className="w-3 h-3 text-rose-400" />
                  <span className="text-sm font-extrabold text-rose-400">
                    {activeTab === 'micro_bargain' ? sliderReadinessAfter : evaluation.readiness_after_pct}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Catch-Up Debt</p>
                <p className="text-sm font-extrabold text-amber-400 mt-0.5">
                  +{activeTab === 'micro_bargain' ? sliderDebtSaved : evaluation.catchup_debt_minutes} <span className="text-xs font-normal">mins</span>
                </p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60">
                <p className="text-[10px] uppercase font-bold text-slate-400">Burnout Impact</p>
                <p className="text-sm font-extrabold text-slate-300 mt-0.5">
                  {activeTab === 'micro_bargain' ? '-0.01' : `+${evaluation.burnout_risk_delta * 100}%`}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Preset Counter-Trades vs. 4. Live Micro-Negotiation Bargaining */}
          <div className="flex items-center space-x-2 bg-navy-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('trades')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'trades' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suggested Counter-Trades
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('micro_bargain')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                activeTab === 'micro_bargain' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 mr-1" />
              <span>Micro-Bargain Slider</span>
            </button>
          </div>

          {/* TAB 1: Preset Proposals */}
          {activeTab === 'trades' && (
            <div className="space-y-2.5 animate-fadeIn">
              {evaluation.proposals.map((proposal) => {
                const isSelected = selectedProposalId === proposal.id;
                return (
                  <div
                    key={proposal.id}
                    onClick={() => setSelectedProposalId(proposal.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50 scale-[1.01]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {getProposalIcon(proposal.action_type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="text-sm font-bold text-white">{proposal.title}</h5>
                            {proposal.readiness_impact_mitigated > 0 && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Saves +{proposal.readiness_impact_mitigated}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {proposal.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: 4. Live Micro-Negotiation Bargaining Slider */}
          {activeTab === 'micro_bargain' && (
            <div className="bg-navy-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Bargain Time: Do a fraction right now
                  </span>
                  <span className="text-lg font-black text-white font-mono bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                    {bargainMinutes} min
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Drag slider to negotiate a manageable mini-session now instead of kicking 90 mins into tomorrow.
                </p>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={bargainMinutes}
                onChange={(e) => setBargainMinutes(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10m (Quick Formula Scan)</span>
                <span>30m (Target PYQ Sprint)</span>
                <span>60m (Solid Depth)</span>
              </div>

              {/* Dynamic Live Bargain Outcome */}
              <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  ⚡ Saves <strong className="text-emerald-400">+{sliderReadinessGain}%</strong> readiness points!
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Zero guilt • Session logged
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-navy-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'trades' ? (
            <button
              onClick={() => onAcceptProposal(selectedProposalId, undefined, reason)}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Accept Trade & Rebalance</span>
            </button>
          ) : (
            <button
              onClick={() => onAcceptProposal('micro_custom', bargainMinutes, reason)}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sliders className="w-4 h-4" />
              <span>Lock In {bargainMinutes}-Min Micro Sprint</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
