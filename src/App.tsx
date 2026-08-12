import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExtractorForm } from './components/ExtractorForm';
import { TweetCard } from './components/TweetCard';
import { MediaSection } from './components/MediaSection';
import { CdnUrlsList } from './components/CdnUrlsList';
import { RawJsonViewer } from './components/RawJsonViewer';
import { AiInsights } from './components/AiInsights';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MediaLightbox } from './components/MediaLightbox';
import type { ExtractedTweetData, ExtractionHistoryItem, TweetMedia } from './types';
import { Sparkles, Layers, Code2, AlertCircle, RefreshCw, FileText, Share2, Check, ExternalLink } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'x_extractor_history_v1';
const DEFAULT_SAMPLE_URL = 'https://x.com/Sunil_Goriyaa/status/2086820170551718369';

export default function App() {
  const [tweetData, setTweetData] = useState<ExtractedTweetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cdn' | 'ai' | 'json'>('overview');
  const [history, setHistory] = useState<ExtractionHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [lightboxMedia, setLightboxMedia] = useState<TweetMedia | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history helper
  const addToHistory = (data: ExtractedTweetData) => {
    const newItem: ExtractionHistoryItem = {
      id: data.id,
      url: data.url,
      authorName: data.author.name,
      authorHandle: data.author.handle,
      textSnippet: data.text ? data.text.slice(0, 100) : '',
      extractedAt: Date.now(),
      mediaCount: data.media ? data.media.length : 0,
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== data.id);
      const updated = [newItem, ...filtered].slice(0, 30); // keep last 30
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  const handleExtract = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const contentType = res.headers.get('content-type') || '';
      let json: any = null;

      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const textErr = await res.text();
        throw new Error(
          `Server response error (HTTP ${res.status}): ${
            textErr.length > 120 ? textErr.slice(0, 120) + '...' : textErr || 'Non-JSON response received'
          }`
        );
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract metadata from this link.');
      }

      setTweetData(json.data);
      addToHistory(json.data);
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'An unexpected error occurred.');
      setTweetData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto load requested sample link on initial mount if empty
  useEffect(() => {
    handleExtract(DEFAULT_SAMPLE_URL);
  }, []);

  const handleShareApp = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f5f1ec] flex flex-col text-[#111111]">
      {/* Header Bar */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={() => setTweetData(null)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Search Input Card */}
        <section className="space-y-2">
          <ExtractorForm
            onExtract={handleExtract}
            isLoading={isLoading}
            initialUrl={DEFAULT_SAMPLE_URL}
          />
        </section>

        {/* Error Alert Card */}
        {error && (
          <div className="intercom-card p-4 sm:p-5 border-rose-200 bg-rose-50 flex items-start gap-3 text-rose-800 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <h3 className="font-bold mb-1 text-rose-900">Extraction Unsuccessful</h3>
              <p>{error}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleExtract(DEFAULT_SAMPLE_URL)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Sample Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Tweet Data Layout */}
        {tweetData && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            {/* Segmented Navigation Tabs */}
            <div className="p-1 bg-[#ffffff] border border-[#d3cec6] rounded-xl flex items-center justify-between text-xs font-semibold text-[#111111] select-none shadow-sm">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-[#f5f1ec] text-[#111111] shadow-sm font-bold'
                    : 'hover:bg-[#f5f1ec]/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Overview & Media</span>
                {tweetData.media && tweetData.media.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-[#d3cec6]/30 text-[#111111] rounded-md">
                    {tweetData.media.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('cdn')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'cdn'
                    ? 'bg-[#f5f1ec] text-[#111111] shadow-sm font-bold'
                    : 'hover:bg-[#f5f1ec]/50'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>CDN Asset Links</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-[#d3cec6]/30 text-[#111111] rounded-md">
                  {tweetData.cdnUrlsList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ai'
                    ? 'bg-[#f5f1ec] text-[#111111] shadow-sm font-bold'
                    : 'hover:bg-[#f5f1ec]/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#ff5600]" />
                <span>AI Insights</span>
              </button>

              <button
                onClick={() => setActiveTab('json')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'bg-[#f5f1ec] text-[#111111] shadow-sm font-bold'
                    : 'hover:bg-[#f5f1ec]/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Raw JSON</span>
              </button>
            </div>

            {/* Tab 1: Overview & Media */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Main Tweet Preview Card */}
                <TweetCard tweet={tweetData} />

                {/* Extracted Photos & Videos */}
                <MediaSection
                  mediaList={tweetData.media}
                  tweetId={tweetData.id}
                  onOpenLightbox={(media) => setLightboxMedia(media)}
                />
              </div>
            )}

            {/* Tab 2: Direct CDN Asset Links */}
            {activeTab === 'cdn' && (
              <CdnUrlsList
                items={tweetData.cdnUrlsList}
                tweetId={tweetData.id}
              />
            )}

            {/* Tab 3: Gemini AI Content Insights */}
            {activeTab === 'ai' && (
              <AiInsights tweet={tweetData} />
            )}

            {/* Tab 4: Raw JSON Inspector */}
            {activeTab === 'json' && (
              <RawJsonViewer rawJson={tweetData.rawJson} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">𝕏 Metadata Extractor</span>
            <span>•</span>
            <span>Extracts high-resolution media CDN links & metadata</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareApp}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
            >
              {copiedShareUrl ? <Check className="w-3 h-3 text-green-600" /> : <Share2 className="w-3 h-3" />}
              <span>{copiedShareUrl ? 'Link Copied' : 'Share App'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectUrl={(url) => handleExtract(url)}
        onClearHistory={handleClearHistory}
      />

      {/* Media Lightbox */}
      <MediaLightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
        tweetId={tweetData?.id || 'media'}
      />
    </div>
  );
}
