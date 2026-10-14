
import React from 'react';
import { Sparkles, RotateCcw, History as HistoryIcon } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

const Header: React.FC<HeaderProps> = ({ onReset, onToggleHistory, historyCount }) => {
  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-dark-border bg-dark-bg/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Prompt Refiner</h1>
          <p className="text-xs text-slate-400">Intelligent Prompt Engineering Assistant</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-xs text-slate-400 font-medium group"
            title="Clear all and start over"
          >
            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        )}
        
        <button
          onClick={onToggleHistory}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-300 transition-all text-xs text-slate-400 font-medium"
        >
          <HistoryIcon size={14} />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold shadow-sm px-1">
              {historyCount > 99 ? '99+' : historyCount}
            </span>
          )}
        </button>

        <span className="hidden md:inline-block px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-xs text-slate-400 font-mono">
          Powered by Gemini 4 Argon
        </span>
      </div>
    </header>
  );
};

export default Header;
