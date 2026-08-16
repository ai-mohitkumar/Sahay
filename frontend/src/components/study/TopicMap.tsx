import { Play, FileText } from 'lucide-react';
import { SubjectStudyTree, TopicDetail } from '../../types';

interface TopicMapProps {
  tree: SubjectStudyTree | null;
  loading: boolean;
  onStartDrill: (topic: TopicDetail) => void;
  onViewMaterial: (topic: TopicDetail) => void;
}

export const TopicMap: React.FC<TopicMapProps> = ({
  tree,
  loading,
  onStartDrill,
  onViewMaterial,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
        <div className="h-44 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
      </div>
    );
  }

  if (!tree) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subject Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span
              className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${tree.subject_color}20`,
                borderColor: `${tree.subject_color}40`,
                color: tree.subject_color,
              }}
            >
              Curated Syllabus Tree
            </span>
            <span className="text-xs text-slate-400 font-mono">• {tree.total_topics} High-Yield Modules</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{tree.subject_name}</h2>
          <p className="text-xs text-slate-400">
            Topic breakdown with genuine mastery computed directly from your question attempts.
          </p>
        </div>

        <div className="bg-navy-950 border border-indigo-500/40 p-4 rounded-2xl text-center min-w-[130px]">
          <span className="text-[10px] uppercase font-bold text-slate-400">Subject Readiness</span>
          <p className="text-2xl font-extrabold text-white mt-0.5">{tree.overall_readiness_pct}%</p>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Core Modules & Practice Drills
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {tree.topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {topic.importance_weight}x Weightage
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                    {topic.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ~{topic.estimated_hours} hrs syllabus
                  </span>
                </div>

                <h4 className="text-base font-bold text-white tracking-tight">{topic.name}</h4>

                {/* Progress bar */}
                <div className="flex items-center space-x-3 text-xs text-slate-400 max-w-md">
                  <div className="flex-1 h-2 rounded-full bg-navy-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${topic.readiness_pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-white font-bold">{topic.readiness_pct}% Readiness</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                {topic.materials.length > 0 && (
                  <button
                    onClick={() => onViewMaterial(topic)}
                    className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Formula Sheet</span>
                  </button>
                )}

                <button
                  onClick={() => onStartDrill(topic)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice PYQ Drill ({topic.total_questions})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
