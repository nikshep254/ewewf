import React, { useState } from 'react';
import { Code, Copy, Check, ChevronDown, ChevronRight, Search } from 'lucide-react';

interface RawJsonViewerProps {
  rawJson: any;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ rawJson }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!rawJson) return null;

  const jsonString = JSON.stringify(rawJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = jsonString.split('\n');
  const filteredLines = searchQuery.trim()
    ? lines.filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines;

  return (
    <div className="ios-card overflow-hidden">
      {/* Header Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Developer Payload (Raw JSON)</h3>
            <p className="text-xs text-slate-500">View complete API response schema & raw keys</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            {lines.length} lines
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded Inspector */}
      {isOpen && (
        <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search JSON keys/values..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 text-slate-200 placeholder-slate-500 rounded-lg outline-none text-xs border border-slate-700 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Payload' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto max-h-[350px] leading-relaxed text-emerald-400 select-all border border-slate-800">
            <code>
              {searchQuery.trim() ? filteredLines.join('\n') : jsonString}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};
