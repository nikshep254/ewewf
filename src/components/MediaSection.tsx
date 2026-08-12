import React, { useState } from 'react';
import { Download, Copy, Check, ExternalLink, Play, Film, Image as ImageIcon, Sparkles, Layers, Maximize2 } from 'lucide-react';
import type { TweetMedia, PhotoMedia, VideoMedia, MediaVariant } from '../types';

interface MediaSectionProps {
  mediaList: TweetMedia[];
  tweetId: string;
  onOpenLightbox?: (media: TweetMedia) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  mediaList,
  tweetId,
  onOpenLightbox,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [playerModes, setPlayerModes] = useState<Record<string, 'native' | 'webviewer'>>({});

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="ios-card p-6 text-center text-slate-500 text-sm">
        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        No photo or video media assets found in this post.
      </div>
    );
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectVariant = (videoId: string, variantUrl: string) => {
    setSelectedVariants((prev) => ({ ...prev, [videoId]: variantUrl }));
  };

  const togglePlayerMode = (videoId: string, mode: 'native' | 'webviewer') => {
    setPlayerModes((prev) => ({ ...prev, [videoId]: mode }));
  };

  const photos = mediaList.filter((m) => m.type === 'photo') as PhotoMedia[];
  const videos = mediaList.filter((m) => m.type === 'video' || m.type === 'gif') as VideoMedia[];

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          Extracted Media Assets ({mediaList.length})
        </h2>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Direct CDN Links
        </span>
      </div>

      {/* Photos Section */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> Photos ({photos.length})
          </div>
          <div className={`grid gap-4 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {photos.map((photo, index) => (
              <div key={photo.id || index} className="ios-card overflow-hidden group">
                <div className="relative aspect-video sm:aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onOpenLightbox && onOpenLightbox(photo)}>
                  <img
                    src={photo.url}
                    alt={photo.altText || `Extracted photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    <span>HD Original</span>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-600 truncate">
                    Photo #{index + 1} {photo.width && photo.height ? `(${photo.width}x${photo.height})` : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(photo.url, photo.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-all"
                      title="Copy Direct Photo CDN URL"
                    >
                      {copiedId === photo.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === photo.id ? 'Copied' : 'Copy URL'}</span>
                    </button>
                    <a
                      href={`/api/download?url=${encodeURIComponent(photo.url)}&filename=tweet_${tweetId}_photo_${index + 1}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Direct HD Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-blue-500" /> Videos & Animated GIFs ({videos.length})
          </div>

          <div className="space-y-4">
            {videos.map((video, index) => {
              const currentVariantUrl = selectedVariants[video.id] || video.url;
              const selectedVariant = video.variants.find((v) => v.url === currentVariantUrl) || video.variants[0];
              const mode = playerModes[video.id] || 'native';
              const webViewerUrl = `https://video.twitterwebviewer.com/?url=${encodeURIComponent(currentVariantUrl)}`;

              return (
                <div key={video.id || index} className="ios-card overflow-hidden">
                  {/* Player Top Controls / Mode Switcher */}
                  <div className="bg-slate-900 px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => togglePlayerMode(video.id, 'native')}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                          mode === 'native'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Native HTML5</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePlayerMode(video.id, 'webviewer')}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                          mode === 'webviewer'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 text-amber-400" />
                        <span>Twitter Web Viewer</span>
                      </button>
                    </div>

                    <a
                      href={webViewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-all"
                    >
                      <span>Open in twitterwebviewer.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Inline Video Player View */}
                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {mode === 'native' ? (
                      <video
                        key={currentVariantUrl}
                        controls
                        poster={video.thumbnailUrl}
                        className="w-full h-full object-contain max-h-[480px]"
                        preload="metadata"
                      >
                        <source src={currentVariantUrl} type="video/mp4" />
                        Your browser does not support HTML5 video player.
                      </video>
                    ) : (
                      <iframe
                        src={webViewerUrl}
                        title={`Twitter Web Viewer Video #${index + 1}`}
                        className="w-full h-full border-0 rounded-none max-h-[480px]"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    )}
                  </div>

                  {/* Video Quality Selector & Download Actions */}
                  <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {video.type === 'gif' ? 'Animated GIF' : `Video #${index + 1}`}
                          </span>
                          {video.duration && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                              {Math.round(video.duration)}s
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-semibold rounded-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            {mode === 'native' ? 'HTML5 Player' : 'Twitter Web Viewer'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Stream directly via Twitter/X CDN or video.twitterwebviewer.com player.
                        </p>
                      </div>

                      {/* Resolution Switcher */}
                      {video.variants && video.variants.length > 0 && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-500">Resolution:</label>
                          <select
                            value={currentVariantUrl}
                            onChange={(e) => handleSelectVariant(video.id, e.target.value)}
                            className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                          >
                            {video.variants.map((v, vIdx) => (
                              <option key={vIdx} value={v.url}>
                                {v.quality} {v.bitrate ? `(${Math.round(v.bitrate / 1000)} kbps)` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Direct Links Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        {mode === 'webviewer' ? webViewerUrl : currentVariantUrl}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleCopy(webViewerUrl, `${video.id}_wv`)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Copy Twitter Web Viewer Player URL"
                        >
                          {copiedId === `${video.id}_wv` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{copiedId === `${video.id}_wv` ? 'Copied Player Link' : 'Copy Web Viewer URL'}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(currentVariantUrl, video.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          {copiedId === video.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === video.id ? 'Copied MP4' : 'Copy MP4'}</span>
                        </button>

                        <a
                          href={`/api/download?url=${encodeURIComponent(currentVariantUrl)}&filename=tweet_${tweetId}_video_${selectedVariant?.quality || 'HD'}.mp4`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download {selectedVariant?.quality || 'HD'}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
