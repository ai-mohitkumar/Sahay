import { ExternalLink, Sparkles, Clock } from 'lucide-react';
import { Opportunity } from '../../types';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ opportunities }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white">Career & Opportunities Tracker</h3>
          <p className="text-xs text-slate-400">High-yield internships, fellowships & hackathons matched to your profile</p>
        </div>
        <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-1 rounded-xl border border-indigo-500/30">
          {opportunities.length} Active Deadlines
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => {
          const isUrgent = opp.days_remaining <= 20;
          return (
            <div
              key={opp.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {opp.opportunity_type}
                  </span>
                  <span
                    className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      isUrgent
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{opp.days_remaining}d left</span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">{opp.title}</h4>
                <p className="text-xs text-slate-400 font-medium">{opp.organization}</p>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{Math.round(opp.relevance_score * 100)}% Profile Match</span>
                </span>

                {opp.link_url && (
                  <a
                    href={opp.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <span>Details & Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
