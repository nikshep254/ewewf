import React, { useState } from 'react';
import { Sparkles, Loader2, Tag, ThumbsUp, HelpCircle, Layers } from 'lucide-react';
import type { ExtractedTweetData, GeminiAnalysisResult } from '../types';

interface AiInsightsProps {
  tweet: ExtractedTweetData;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ tweet }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetText: tweet.text,
          author: tweet.author,
          metrics: tweet.metrics,
          hasMedia: tweet.media && tweet.media.length > 0,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textErr = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${textErr.slice(0, 100)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate AI insights.');
      }
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error('Gemini analysis error:', err);
      setError(err.message || 'AI analysis unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ios-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Content Summary & Sentiment</h3>
            <p className="text-xs text-slate-500">Gemini-powered natural language analysis</p>
          </div>
        </div>

        {!analysis && !isLoading && (
          <button
            onClick={handleAnalyze}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Analysis</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="p-6 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Analyzing tweet content with Gemini AI...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Executive Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-purple-50/50 p-3 rounded-xl border border-purple-100/60">
              {analysis.summary}
            </p>
          </div>

          {/* Sentiment & Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Sentiment Tone
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                analysis.sentiment === 'negative' ? 'bg-rose-100 text-rose-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {analysis.sentiment}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Key Topics
              </span>
              <div className="flex flex-wrap gap-1">
                {analysis.topics?.map((topic, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-slate-700 text-[11px] font-medium rounded-md border border-slate-200">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          {analysis.keyTakeaways && analysis.keyTakeaways.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Key Takeaways
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {analysis.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
