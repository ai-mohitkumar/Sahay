import { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Briefcase,
  Wallet,
  FileText,
  Heart
} from 'lucide-react';
import { StudentLifeOverview } from '../../types';
import { api } from '../../api/client';
import { CrossDomainAIPanel } from './CrossDomainAIPanel';
import { OpportunitiesView } from './OpportunitiesView';
import { StudentFinanceView } from './StudentFinanceView';
import { LifeAdminVault } from './LifeAdminVault';
import { HealthEnergyView } from './HealthEnergyView';

interface StudentLifeHubProps {
  userId: number;
}

export const StudentLifeHub: React.FC<StudentLifeHubProps> = ({ userId }) => {
  const [overview, setOverview] = useState<StudentLifeOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'cross_ai' | 'career' | 'finances' | 'vault' | 'health'>('cross_ai');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getStudentLifeOverview(userId);
      setOverview(data);
    } catch (err) {
      console.error("Failed to load student life overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        <div className="h-44 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
        <div className="h-64 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6 animate-fadeIn">
      {/* Top Holistic Nudge Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
              6-Pillar Student Operating System
            </span>
            <span className="text-xs text-slate-400 font-mono">• {overview.user_name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-300 font-semibold">Holistic Life Balance:</span>
            <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              84% Optimal
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          "{overview.ai_holistic_nudge}"
        </p>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('cross_ai')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'cross_ai'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Cross-Domain AI Advisor</span>
        </button>

        <button
          onClick={() => setActiveTab('career')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'career'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Career & Deadlines ({overview.active_opportunities_count})</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'finances'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Wallet & Budget</span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'vault'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents & Routines</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'health'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Health & Recovery</span>
        </button>
      </div>

      {/* Sub-Views */}
      <div className="space-y-6">
        {activeTab === 'cross_ai' && (
          <CrossDomainAIPanel userId={userId} />
        )}

        {activeTab === 'career' && (
          <OpportunitiesView opportunities={overview.urgent_deadlines} />
        )}

        {activeTab === 'finances' && (
          <StudentFinanceView
            budget={overview.monthly_budget}
            userId={userId}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'vault' && (
          <LifeAdminVault
            documents={overview.pending_documents}
            routines={overview.daily_routines}
            userId={userId}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'health' && (
          <HealthEnergyView health={overview.health_status} />
        )}
      </div>
    </div>
  );
};
