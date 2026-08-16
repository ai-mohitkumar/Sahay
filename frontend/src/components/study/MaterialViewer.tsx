import { FileText, X } from 'lucide-react';
import { Material } from '../../types';

interface MaterialViewerProps {
  materials: Material[];
  topicName: string;
  onClose: () => void;
}

export const MaterialViewer: React.FC<MaterialViewerProps> = ({
  materials,
  topicName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Formula Sheet & Notes: {topicName}
              </h3>
              <p className="text-xs text-slate-400">High-yield exam review card</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {materials.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No formula sheets uploaded yet for this topic.</p>
          ) : (
            materials.map((mat) => (
              <div key={mat.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-300">{mat.title}</h4>
                  <span className="text-[10px] font-mono bg-navy-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    Source: {mat.source}
                  </span>
                </div>

                <div className="bg-navy-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                  {mat.content_body}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-navy-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
