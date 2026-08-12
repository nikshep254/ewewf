import React from 'react';
import { X, Trash2, ExternalLink, History, Clock } from 'lucide-react';
import type { ExtractionHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExtractionHistoryItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectUrl,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* iOS Slide-over Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-base">Extraction History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No previous extractions yet.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectUrl(item.url);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    {item.authorName} <span className="font-normal text-slate-500">@{item.authorHandle}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.extractedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 font-normal">
                  {item.textSnippet || 'Media post'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                  <span className="font-medium text-blue-600">
                    {item.mediaCount} media assets
                  </span>
                  <span className="text-blue-600 group-hover:underline flex items-center gap-0.5">
                    Re-extract <ExternalLink className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {history.length} saved links
            </span>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
