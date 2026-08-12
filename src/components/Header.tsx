import React from 'react';
import { Sparkles, History, Layers, ExternalLink } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#f5f1ec] border-b border-[#d3cec6] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* App Branding */}
        <div 
          onClick={onReset} 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#111111] text-[#ffffff] flex items-center justify-center font-bold text-lg group-hover:bg-[#000000] transition-colors">
            𝕏
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-medium text-[#111111] text-base tracking-tight">
                X Media & Metadata
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#ff5600]/10 text-[#ff5600] rounded-md border border-[#ff5600]/20">
                Fin Integration
              </span>
            </div>
            <p className="text-xs text-[#626260] font-normal">Extraction Tool</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            title="Extraction History"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium items-center gap-1 transition-all"
          >
            <span>x.com</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
