import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Code2, Filter, FileText } from 'lucide-react';
import type { ExtractedTweetData } from '../types';

interface CdnUrlsListProps {
  items: ExtractedTweetData['cdnUrlsList'];
  tweetId: string;
}

export const CdnUrlsList: React.FC<CdnUrlsListProps> = ({ items, tweetId }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!items || items.length === 0) {
    return (
      <div className="ios-card p-6 text-center text-slate-500 text-sm">
        No CDN URLs extracted.
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  const handleCopyOne = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = (asJson = false) => {
    if (asJson) {
      navigator.clipboard.writeText(JSON.stringify(filteredItems, null, 2));
    } else {
      const text = filteredItems.map((i) => `${i.label}:\n${i.url}`).join('\n\n');
      navigator.clipboard.writeText(text);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textContent = `Twitter/X Extracted CDN URLs for Post ID: ${tweetId}\nGenerated: ${new Date().toISOString()}\n\n` +
      filteredItems.map((i) => `[${i.category}] ${i.label}\nURL: ${i.url}`).join('\n\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tweet_${tweetId}_cdn_urls.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ios-card p-5 sm:p-6 space-y-4">
      {/* Header & Copy All Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            Direct CDN Asset Inspector
          </h2>
          <p className="text-xs text-slate-500">
            {filteredItems.length} media & asset links extracted
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleCopyAll(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied All!' : 'Copy All Text'}</span>
          </button>

          <button
            onClick={() => handleCopyAll(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Copy as JSON</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export .txt</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-blue-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md">
                  {item.category}
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {item.label}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 truncate select-all">
                {item.url}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleCopyOne(item.url, index)}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1 transition-all"
                title="Copy URL"
              >
                {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all"
                title="Open CDN Link in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
