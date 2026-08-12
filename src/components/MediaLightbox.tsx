import React from 'react';
import { X, Download, Copy, ExternalLink, Check } from 'lucide-react';
import type { TweetMedia, PhotoMedia, VideoMedia } from '../types';

interface MediaLightboxProps {
  media: TweetMedia | null;
  onClose: () => void;
  tweetId: string;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  onClose,
  tweetId,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!media) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          {media.type === 'photo' ? 'HD Image Preview' : 'HD Video Preview'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy CDN URL'}</span>
          </button>

          <a
            href={`/api/download?url=${encodeURIComponent(media.url)}&filename=tweet_${tweetId}_media.${media.type === 'photo' ? 'jpg' : 'mp4'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2">
        {media.type === 'photo' ? (
          <img
            src={media.url}
            alt="Expanded view"
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <video
            controls
            autoPlay
            poster={media.thumbnailUrl}
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
          >
            <source src={media.url} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
};
