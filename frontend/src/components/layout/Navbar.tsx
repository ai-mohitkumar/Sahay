import { Bell, Calendar, TrendingUp, History, UserPlus, BrainCircuit, Users, MessageSquareHeart, BookOpen, Sparkles, Mail } from 'lucide-react';
import { UserSummary } from '../../types';

interface NavbarProps {
  currentTab: 'timeline' | 'simulation' | 'history' | 'pods' | 'coach' | 'study' | 'essentials' | 'alarms' | 'onboarding';
  setCurrentTab: (tab: 'timeline' | 'simulation' | 'history' | 'pods' | 'coach' | 'study' | 'essentials' | 'alarms' | 'onboarding') => void;
  users: UserSummary[];
  currentUserId: number;
  setCurrentUserId?: (id: number) => void;
  onOpenProfileSwitcher?: () => void;
  onOpenEmailSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  users,
  currentUserId,
  onOpenProfileSwitcher,
  onOpenEmailSettings,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-navy-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('timeline')}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                Sahay
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Cognitive Negotiator
            </p>
          </div>
        </div>

        {/* Primary Streamlined Nav Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {/* Primary 1: 24h Flow */}
          <button
            onClick={() => setCurrentTab('timeline')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'timeline'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>24h Flow</span>
          </button>

          {/* Primary 2: Activity Ledger & Stats */}
          <button
            onClick={() => setCurrentTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Activity & Stats</span>
            <span className="sm:hidden">Stats</span>
          </button>

          {/* Explore Dropdown for Deep Features */}
          <div className="relative group">
            <button
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition"
            >
              <span>Explore</span>
              <span className="text-[10px] text-slate-400 group-hover:rotate-180 transition-transform">▾</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-1 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl space-y-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <button
                onClick={() => setCurrentTab('simulation')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  currentTab === 'simulation' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Future-Self Simulation</span>
              </button>

              <button
                onClick={() => setCurrentTab('coach')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  currentTab === 'coach' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-purple-400" />
                <span>Coach Letter</span>
              </button>

              <button
                onClick={() => setCurrentTab('study')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  currentTab === 'study' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Study & AI Tutor</span>
              </button>

              <button
                onClick={() => setCurrentTab('essentials')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  currentTab === 'essentials' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Life Essentials</span>
              </button>

              <button
                onClick={() => setCurrentTab('alarms')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  currentTab === 'alarms' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Circadian Alarms</span>
              </button>

              <button
                onClick={() => setCurrentTab('pods')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                  currentTab === 'pods' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accountability Pods</span>
              </button>

              <div className="pt-1 border-t border-slate-800 my-1"></div>

              <button
                onClick={() => {
                  if (onOpenEmailSettings) onOpenEmailSettings();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left text-purple-300 hover:bg-purple-950/50 hover:text-white transition"
              >
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Email Reports & Digests</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Unlimited Profile Vault Pill & Switcher */}
        <div className="flex items-center space-x-2.5">
          {(() => {
            const currentUser = users.find((u) => u.id === currentUserId) || users[0];
            return (
              <button
                onClick={() => {
                  if (onOpenProfileSwitcher) onOpenProfileSwitcher();
                }}
                className="flex items-center space-x-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs transition shadow-sm group"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-black text-white shrink-0">
                  {currentUser ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-slate-200 text-xs leading-none flex items-center gap-1.5">
                    <span>{currentUser ? currentUser.name : 'Student Profile'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-medium">
                    {currentUser?.exam_name || 'Unlimited Profiles'}
                  </span>
                </div>
                <span className="text-slate-500 group-hover:text-slate-300 text-xs">▼</span>
              </button>
            );
          })()}

          <button
            onClick={() => {
              if (onOpenProfileSwitcher) onOpenProfileSwitcher();
              else setCurrentTab('onboarding');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-colors"
            title="Manage Unlimited Profiles"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+ Profiles ({users.length})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
