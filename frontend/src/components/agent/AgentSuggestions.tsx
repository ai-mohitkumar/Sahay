import React from 'react';
import { Zap } from 'lucide-react';

interface AgentSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const AgentSuggestions: React.FC<AgentSuggestionsProps> = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
      <Zap className="w-3 h-3 text-amber-400 shrink-0" />
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(s)}
          className="text-[11px] bg-slate-900/90 hover:bg-indigo-950/60 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl border border-slate-800 hover:border-indigo-500/40 shrink-0 transition-all font-medium"
        >
          {s}
        </button>
      ))}
    </div>
  );
};
