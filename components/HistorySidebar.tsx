
import React from 'react';
import { X, Trash2, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onDelete,
  onClearAll 
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-dark-surface border-l border-dark-border shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-2 text-slate-200">
            <Clock className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold">History</h2>
            <span className="px-2 py-0.5 rounded-full bg-dark-bg border border-dark-border text-xs text-slate-400">
              {history.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-bg rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <Clock size={48} className="opacity-20" />
              <p>No history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative flex flex-col gap-2 p-3 rounded-xl bg-dark-bg/50 border border-dark-border hover:border-brand-500/50 hover:bg-dark-bg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-brand-400 font-mono">
                      <Clock size={12} />
                      {formatDate(item.timestamp)}
                    </div>
                    <button
                      onClick={(e) => onDelete(item.id, e)}
                      className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <MessageSquare size={16} className="text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {item.originalPrompt || "Image only request"}
                    </p>
                  </div>
                  
                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-dark-border bg-dark-surface">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
                  onClearAll();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-900/30 text-red-400 hover:bg-red-950/30 hover:border-red-500/50 transition-all text-sm font-medium"
            >
              <Trash2 size={16} />
              Clear All History
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default HistorySidebar;
