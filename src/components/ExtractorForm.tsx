import React, { useState } from 'react';
import { Search, Link, Clipboard, X, Loader2, Sparkles, Check } from 'lucide-react';

interface ExtractorFormProps {
  onExtract: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
}

const SAMPLE_LINKS = [
  {
    label: "Sunil_Goriyaa Post",
    url: "https://x.com/Sunil_Goriyaa/status/2086820170551718369",
    tag: "Requested Sample",
  },
  {
    label: "Twitter Web Viewer Link",
    url: "https://video.twitterwebviewer.com/?url=https%3A%2F%2Fvideo.twimg.com%2Famplify_video%2F2087059207258583040%2Fvid%2Favc1%2F1280x720%2FtQv6_2ICc0iuN5WV.mp4%3Ftag%3D29",
    tag: "Direct Player Link",
  },
  {
    label: "SpaceX Launch Video",
    url: "https://x.com/SpaceX/status/1828555230919184518",
    tag: "1080p Video",
  },
  {
    label: "NASA Photo Gallery",
    url: "https://x.com/NASA/status/1827404899557343276",
    tag: "Multi-Photos",
  },
];

export const ExtractorForm: React.FC<ExtractorFormProps> = ({
  onExtract,
  isLoading,
  initialUrl = "",
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [pasted, setPasted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onExtract(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 1500);
      }
    } catch (err) {
      console.error("Clipboard read error:", err);
    }
  };

  const handleClear = () => {
    setUrl("");
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center intercom-input p-1.5 transition-all">
          <div className="pl-3 pr-2 text-slate-400 flex items-center">
            <Link className="w-5 h-5 text-[#ff5600]" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Twitter or X status link (e.g. https://x.com/user/status/...)"
            className="w-full bg-transparent py-3 text-[#111111] placeholder-[#9c9fa5] text-sm sm:text-base font-normal outline-none"
            disabled={isLoading}
          />

          {url && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePaste}
            className="hidden sm:flex items-center gap-1 px-3 py-2 mr-1 rounded-md intercom-btn-secondary text-xs font-semibold transition-all active:scale-95"
            title="Paste from Clipboard"
          >
            {pasted ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Clipboard className="w-3.5 h-3.5" />}
            <span>{pasted ? "Pasted!" : "Paste"}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={`px-5 py-3 rounded-md font-semibold text-sm flex items-center gap-2 transition-all ${
              isLoading || !url.trim()
                ? "bg-[#ebe7e1] text-[#9c9fa5] cursor-not-allowed"
                : "intercom-btn-primary"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Extract</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Quick Links */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Try:
        </span>
        {SAMPLE_LINKS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setUrl(sample.url);
              onExtract(sample.url);
            }}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs group"
          >
            <span>{sample.label}</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 text-slate-500 rounded-md">
              {sample.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
