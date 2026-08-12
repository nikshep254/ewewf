import React, { useState } from 'react';
import { Heart, Repeat, MessageCircle, Eye, Bookmark, Share2, Check, ExternalLink, ShieldCheck, Copy, Quote, HelpCircle } from 'lucide-react';
import type { ExtractedTweetData } from '../types';

interface TweetCardProps {
  tweet: ExtractedTweetData;
}

/**
 * Format numbers like 12500 -> 12.5K
 */
function formatNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Formats tweet text with highlighted hashtags, mentions, and links
 */
function formatTweetText(text: string) {
  if (!text) return null;

  // Split by whitespace or tokens
  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-blue-600 font-medium hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    if (part.startsWith('@')) {
      return (
        <span key={index} className="text-blue-600 font-medium hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5"
        >
          {part.length > 30 ? part.slice(0, 28) + '…' : part}
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    }
    return part;
  });
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const [copiedText, setCopiedText] = useState(false);
  const { author, metrics, createdAt, text, url, poll, quotedTweet } = tweet;

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="ios-card p-5 sm:p-6 transition-all">
      {/* Header: Author & Options */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={author.avatarUrl || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200/80 shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-base leading-tight">
                {author.name}
              </span>
              {author.verified && (
                <span title={`Verified (${author.verifiedType || 'blue'})`}>
                  <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500/20 inline" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
              <span>@{author.handle}</span>
              {author.followers !== undefined && author.followers > 0 && (
                <>
                  <span>•</span>
                  <span>{formatNumber(author.followers)} followers</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
            title="Copy Tweet Text"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedText ? 'Copied' : 'Copy Text'}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-all active:scale-95"
            title="Open on X.com"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Tweet Body Text */}
      <div className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal mb-4">
        {formatTweetText(text)}
      </div>

      {/* Poll Component if Present */}
      {poll && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Poll Results
            </span>
            <span>{formatNumber(poll.totalVotes)} total votes</span>
          </div>
          <div className="space-y-2">
            {poll.options.map((opt, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-slate-200/60 p-2.5">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-blue-500/20 transition-all duration-500"
                  style={{ width: `${opt.percentage}%` }}
                />
                <div className="relative flex justify-between text-xs font-medium text-slate-800 z-10">
                  <span>{opt.label}</span>
                  <span className="font-bold">{opt.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quoted Tweet Component if Present */}
      {quotedTweet && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
            <Quote className="w-3 h-3 text-slate-400" /> Quoted Post
          </div>
          <div className="flex items-center gap-2 mb-2">
            <img
              src={quotedTweet.author.avatarUrl}
              alt={quotedTweet.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-bold text-xs text-slate-900">{quotedTweet.author.name}</span>
            <span className="text-xs text-slate-500">@{quotedTweet.author.handle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug font-normal line-clamp-3">
            {quotedTweet.text}
          </p>
        </div>
      )}

      {/* Date & Metrics Footer */}
      <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>{formattedDate}</div>

        <div className="flex items-center gap-3 sm:gap-4 font-medium flex-wrap">
          <div className="flex items-center gap-1 text-slate-700">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>{formatNumber(metrics.likes)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-700">
            <Repeat className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formatNumber(metrics.retweets)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-700">
            <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>{formatNumber(metrics.replies)}</span>
          </div>
          {metrics.views > 0 && (
            <div className="flex items-center gap-1 text-slate-700">
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span>{formatNumber(metrics.views)}</span>
            </div>
          )}
          {metrics.bookmarks > 0 && (
            <div className="flex items-center gap-1 text-slate-700">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>{formatNumber(metrics.bookmarks)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
