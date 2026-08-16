import React from 'react';
import { Bot, User, ShieldCheck } from 'lucide-react';
import { AgentMessage as AgentMessageType } from '../../types';

interface AgentMessageProps {
  message: AgentMessageType;
}

export const AgentMessage: React.FC<AgentMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} animate-fadeIn`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-md ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-lg'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Grounding Source Badge */}
        {!isUser && message.grounding_source && (
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 px-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Source: {message.grounding_source}</span>
          </div>
        )}
      </div>
    </div>
  );
};
