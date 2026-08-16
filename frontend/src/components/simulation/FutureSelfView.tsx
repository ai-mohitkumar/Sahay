import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { FutureSelfData } from '../../types';

interface FutureSelfViewProps {
  data: FutureSelfData | null;
  loading: boolean;
}

export const FutureSelfView: React.FC<FutureSelfViewProps> = ({ data, loading }) => {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
        <div className="h-64 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
      </div>
    );
  }

  if (!data) return null;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(data.shareable_summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG Chart Dimensions
  const width = 800;
  const height = 240;
  const padding = 40;

  const points = data.simulation_points;
  const maxDay = points.length || 30;

  // Coordinate scales
  const getX = (day: number) => padding + ((day - 1) / (maxDay - 1)) * (width - 2 * padding);
  const getY = (val: number) => height - padding - ((val - 20) / 80) * (height - 2 * padding);

  // SVG Paths
  const currentPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.readiness_current_pace)}`).join(' ');
  const discPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.readiness_disciplined)}`).join(' ');
  const slackPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getY(p.readiness_slacking)}`).join(' ');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Future Self Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">• 30-Day Forward Forecast</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
            Where Your Current Habits Lead in 30 Days
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulated dynamically from your real completion rate ({data.historical_compliance_rate_pct}%).
          </p>
        </div>

        <button
          onClick={handleCopyShare}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 transition-all self-start active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Copied Summary!' : 'Share My 30-Day Trajectory'}</span>
        </button>
      </div>

      {/* 4 Hero Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Projected Readiness</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-white">{data.projected_30d_readiness_pct}%</span>
            <span className="text-xs font-bold text-emerald-400">
              +{Math.round(data.projected_30d_readiness_pct - data.current_readiness_pct)}% in 30d
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Target Exam: {data.exam_name}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-950/50 to-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300">Predicted Score Bracket</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-white">{data.projected_score_range}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Top 8-12% percentile rank</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Burnout Safety Index</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-emerald-400">{data.burnout_score}</span>
            <span className="text-xs font-semibold text-emerald-300">({data.burnout_status})</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Sufficient sleep & buffer rhythm</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Schedule Compliance</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-white">{data.historical_compliance_rate_pct}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Based on activity history</p>
        </div>
      </div>

      {/* Trajectory Graph (SVG) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-lg text-white">30-Day Readiness Simulation Curves</h3>
            <p className="text-xs text-slate-400">Comparing your Current Pace vs Disciplined vs Slacking</p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 rounded bg-indigo-500"></span>
              <span className="text-slate-200">Current Pace</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 rounded bg-emerald-400"></span>
              <span className="text-slate-400">Disciplined (100%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 rounded bg-rose-400"></span>
              <span className="text-slate-400">Slacking (50%)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[300px] select-none">
            {/* Grid lines */}
            {[30, 50, 70, 90].map((val) => (
              <g key={val}>
                <line
                  x1={padding}
                  y1={getY(val)}
                  x2={width - padding}
                  y2={getY(val)}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text x={padding - 10} y={getY(val) + 4} fill="#64748b" fontSize="10" textAnchor="end">
                  {val}%
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {[1, 10, 20, 30].map((d) => (
              <text key={d} x={getX(d)} y={height - 15} fill="#64748b" fontSize="10" textAnchor="middle">
                Day {d}
              </text>
            ))}

            {/* Slacking curve */}
            <path d={slackPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />

            {/* Disciplined curve */}
            <path d={discPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />

            {/* Current Pace curve (Solid & Highlighted) */}
            <path d={currentPath} fill="none" stroke="#6366f1" strokeWidth="3.5" />

            {/* Endpoint bubble */}
            <circle
              cx={getX(30)}
              cy={getY(data.projected_30d_readiness_pct)}
              r="6"
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Shareable Screenshot Card (Virality feature for WhatsApp/Instagram) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
              #SahayFutureSelf
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
              "{data.shareable_summary}"
            </h3>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-4">
            <span>🎯 <strong>{data.exam_name}</strong></span>
            <span>⚡ <strong>{data.projected_30d_readiness_pct}%</strong> Readiness</span>
            <span>🛡️ <strong>{data.burnout_status}</strong></span>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Generated by Sahay AI Negotiator
          </div>
        </div>
      </div>
    </div>
  );
};
