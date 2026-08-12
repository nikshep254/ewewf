import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import type { ExtractedTweetData, TweetMedia, PhotoMedia, VideoMedia, MediaVariant, GeminiAnalysisResult } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for Vercel and cross-origin clients
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Extract tweet ID or unwrapped video URL from Twitter/X URL formats
 */
function extractTweetId(inputUrl: string): { tweetId: string | null; unwrappedVideoUrl: string | null } {
  if (!inputUrl) return { tweetId: null, unwrappedVideoUrl: null };
  let cleaned = inputUrl.trim();

  // If input is twitterwebviewer URL like https://video.twitterwebviewer.com/?url=...
  if (cleaned.includes("video.twitterwebviewer.com")) {
    try {
      const parsed = new URL(cleaned);
      const innerUrl = parsed.searchParams.get("url");
      if (innerUrl) {
        cleaned = decodeURIComponent(innerUrl);
      }
    } catch (e) {}
  }

  // Direct numeric ID
  if (/^\d+$/.test(cleaned)) {
    return { tweetId: cleaned, unwrappedVideoUrl: null };
  }

  // Standard status URL: https://x.com/username/status/123456789 or twitter.com or fxtwitter/vxtwitter
  const statusMatch = cleaned.match(/(?:status|statuses)\/(\d+)/i);
  if (statusMatch && statusMatch[1]) {
    return { tweetId: statusMatch[1], unwrappedVideoUrl: cleaned.includes(".mp4") ? cleaned : null };
  }

  // Check if twimg video URL containing an ID (amplify_video/123456... or ext_tw_video/123456...)
  const twimgIdMatch = cleaned.match(/(?:amplify_video|ext_tw_video|tweet_video)\/(\d+)/i);
  if (twimgIdMatch && twimgIdMatch[1]) {
    return { tweetId: twimgIdMatch[1], unwrappedVideoUrl: cleaned };
  }

  // Check if direct mp4/twimg link
  if (cleaned.includes("video.twimg.com") || cleaned.endsWith(".mp4") || cleaned.includes(".mp4?")) {
    return { tweetId: null, unwrappedVideoUrl: cleaned };
  }

  return { tweetId: null, unwrappedVideoUrl: null };
}

/**
 * Format video quality label from resolution or bitrate
 */
function getQualityLabel(width?: number, height?: number, bitrate?: number): string {
  if (height) {
    if (height >= 1080) return "1080p HD";
    if (height >= 720) return "720p HD";
    if (height >= 480) return "480p SD";
    if (height >= 360) return "360p SD";
    return `${height}p`;
  }
  if (bitrate) {
    if (bitrate > 2000000) return "1080p HD";
    if (bitrate > 800000) return "720p HD";
    if (bitrate > 400000) return "480p SD";
    return "360p SD";
  }
  return "MP4 Video";
}

/**
 * Normalizes FixTweet API payload into standard ExtractedTweetData
 */
function normalizeFixTweetData(fx: any, rawUrl: string): ExtractedTweetData {
  const tweet = fx.tweet || fx;
  const author = tweet.author || {};
  const mediaObj = tweet.media || {};

  const photos: PhotoMedia[] = (mediaObj.photos || []).map((p: any, idx: number) => {
    // Ensure high-res URL
    let highResUrl = p.url;
    if (highResUrl.includes("pbs.twimg.com/media/")) {
      const urlObj = new URL(highResUrl);
      urlObj.searchParams.set("name", "orig");
      highResUrl = urlObj.toString();
    }
    return {
      id: `photo_${idx}_${p.url.split("/").pop() || idx}`,
      type: "photo",
      url: highResUrl,
      thumbnailUrl: p.url,
      width: p.width,
      height: p.height,
      altText: p.altText,
    };
  });

  const videos: VideoMedia[] = (mediaObj.videos || []).map((v: any, idx: number) => {
    const rawVariants: any[] = v.variants || [];
    const variants: MediaVariant[] = [];

    // Add MP4 variants
    rawVariants.forEach((varItem: any) => {
      if (varItem.content_type === "video/mp4" || varItem.url?.endsWith(".mp4")) {
        const quality = getQualityLabel(varItem.width || v.width, varItem.height || v.height, varItem.bitrate);
        variants.push({
          url: varItem.url,
          contentType: "video/mp4",
          bitrate: varItem.bitrate,
          quality,
          width: varItem.width || v.width,
          height: varItem.height || v.height,
        });
      } else if (varItem.content_type === "application/x-mpegURL" || varItem.url?.includes(".m3u8")) {
        variants.push({
          url: varItem.url,
          contentType: "application/x-mpegURL",
          quality: "HLS Stream (m3u8)",
        });
      }
    });

    // If no variants array, use main v.url
    if (variants.length === 0 && v.url) {
      variants.push({
        url: v.url,
        contentType: "video/mp4",
        quality: getQualityLabel(v.width, v.height),
        width: v.width,
        height: v.height,
      });
    }

    // Sort MP4 variants by bitrate descending
    variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    const highestQualityUrl = variants.find((varItem) => varItem.contentType === "video/mp4")?.url || v.url;

    return {
      id: `video_${idx}_${v.url?.split("/").pop() || idx}`,
      type: (v.type === "gif" || tweet.is_gif) ? "gif" : "video",
      url: highestQualityUrl,
      thumbnailUrl: v.thumbnail_url || v.thumbnail || "",
      duration: v.duration,
      width: v.width,
      height: v.height,
      variants,
    };
  });

  const allMedia: TweetMedia[] = [...photos, ...videos];

  // Build flattened CDN URLs list
  const cdnUrlsList: ExtractedTweetData["cdnUrlsList"] = [];

  // Author avatar & banner
  if (author.avatar_url) {
    cdnUrlsList.push({
      category: "Avatar",
      label: `Avatar (@${author.screen_name || "user"})`,
      url: author.avatar_url.replace("_normal", "_400x400"),
    });
  }
  if (author.banner_url) {
    cdnUrlsList.push({
      category: "Banner",
      label: `Banner (@${author.screen_name || "user"})`,
      url: author.banner_url,
    });
  }

  // Photos
  photos.forEach((p, i) => {
    cdnUrlsList.push({
      category: "Photo",
      label: `Photo #${i + 1} (Original HD)`,
      url: p.url,
    });
  });

  // Videos
  videos.forEach((v, i) => {
    if (v.thumbnailUrl) {
      cdnUrlsList.push({
        category: "Video Thumbnail",
        label: `Video #${i + 1} Cover Image`,
        url: v.thumbnailUrl,
      });
    }
    v.variants.forEach((varItem) => {
      cdnUrlsList.push({
        category: varItem.contentType.includes("mpegURL") ? "HLS Stream" : "Video MP4",
        label: `Video #${i + 1} (${varItem.quality}${varItem.bitrate ? ` - ${Math.round(varItem.bitrate / 1000)} kbps` : ""})`,
        url: varItem.url,
      });
    });
  });

  // Quoted tweet handling
  let quotedData: ExtractedTweetData | undefined = undefined;
  if (tweet.quote) {
    quotedData = normalizeFixTweetData(tweet.quote, tweet.quote.url || "");
  }

  // Poll
  let pollInfo = undefined;
  if (tweet.poll) {
    const totalVotes = tweet.poll.total_votes || 0;
    pollInfo = {
      totalVotes,
      options: (tweet.poll.options || []).map((opt: any) => ({
        label: opt.label || opt.text,
        votes: opt.votes || 0,
        percentage: totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0,
      })),
    };
  }

  return {
    id: tweet.id || "",
    url: tweet.url || rawUrl,
    text: tweet.text || "",
    createdAt: tweet.created_at || (tweet.created_timestamp ? new Date(tweet.created_timestamp * 1000).toISOString() : new Date().toISOString()),
    createdTimestamp: tweet.created_timestamp ? tweet.created_timestamp * 1000 : undefined,
    lang: tweet.lang,
    author: {
      name: author.name || "Unknown User",
      handle: author.screen_name || "user",
      avatarUrl: (author.avatar_url || "").replace("_normal", "_400x400"),
      bannerUrl: author.banner_url,
      verified: !!author.verified,
      verifiedType: author.verified_type || (author.verified ? "blue" : "none"),
      bio: author.description,
      followers: author.followers,
      following: author.following,
      tweetsCount: author.tweets,
    },
    metrics: {
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      replies: tweet.replies || 0,
      quotes: tweet.quotes || 0,
      bookmarks: tweet.bookmarks || 0,
      views: tweet.views || 0,
    },
    media: allMedia,
    poll: pollInfo,
    quotedTweet: quotedData,
    cdnUrlsList,
    rawJson: fx,
  };
}

/**
 * Fallback parser for Twitter Syndication API
 */
function normalizeSyndicationData(syn: any, rawUrl: string): ExtractedTweetData {
  const user = syn.user || {};
  const mediaDetails = syn.mediaDetails || [];

  const photos: PhotoMedia[] = [];
  const videos: VideoMedia[] = [];

  mediaDetails.forEach((m: any, idx: number) => {
    if (m.type === "photo") {
      let origUrl = m.media_url_https || m.media_url;
      if (origUrl && origUrl.includes("pbs.twimg.com/media/")) {
        const urlObj = new URL(origUrl);
        urlObj.searchParams.set("name", "orig");
        origUrl = urlObj.toString();
      }
      photos.push({
        id: `photo_${idx}`,
        type: "photo",
        url: origUrl,
        thumbnailUrl: m.media_url_https || m.media_url,
        width: m.original_info?.width,
        height: m.original_info?.height,
      });
    } else if (m.type === "video" || m.type === "animated_gif") {
      const videoInfo = m.video_info || {};
      const rawVariants = videoInfo.variants || [];
      const variants: MediaVariant[] = [];

      rawVariants.forEach((varItem: any) => {
        if (varItem.content_type === "video/mp4") {
          variants.push({
            url: varItem.url,
            contentType: "video/mp4",
            bitrate: varItem.bitrate,
            quality: getQualityLabel(undefined, undefined, varItem.bitrate),
          });
        }
      });

      variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
      const mainUrl = variants[0]?.url || rawVariants[0]?.url || "";

      videos.push({
        id: `video_${idx}`,
        type: m.type === "animated_gif" ? "gif" : "video",
        url: mainUrl,
        thumbnailUrl: m.media_url_https || m.media_url,
        duration: videoInfo.duration_millis ? videoInfo.duration_millis / 1000 : undefined,
        variants,
      });
    }
  });

  const cdnUrlsList: ExtractedTweetData["cdnUrlsList"] = [];
  if (user.profile_image_url_https) {
    cdnUrlsList.push({
      category: "Avatar",
      label: `Avatar (@${user.screen_name || "user"})`,
      url: user.profile_image_url_https.replace("_normal", "_400x400"),
    });
  }

  photos.forEach((p, i) => {
    cdnUrlsList.push({
      category: "Photo",
      label: `Photo #${i + 1} (HD Original)`,
      url: p.url,
    });
  });

  videos.forEach((v, i) => {
    if (v.thumbnailUrl) {
      cdnUrlsList.push({
        category: "Video Thumbnail",
        label: `Video #${i + 1} Thumbnail`,
        url: v.thumbnailUrl,
      });
    }
    v.variants.forEach((varItem) => {
      cdnUrlsList.push({
        category: "Video MP4",
        label: `Video #${i + 1} (${varItem.quality})`,
        url: varItem.url,
      });
    });
  });

  return {
    id: syn.id_str || "",
    url: rawUrl,
    text: syn.text || "",
    createdAt: syn.created_at || new Date().toISOString(),
    lang: syn.lang,
    author: {
      name: user.name || "Twitter User",
      handle: user.screen_name || "user",
      avatarUrl: (user.profile_image_url_https || "").replace("_normal", "_400x400"),
      verified: !!user.is_blue_verified,
      verifiedType: user.is_blue_verified ? "blue" : "none",
    },
    metrics: {
      likes: syn.favorite_count || 0,
      retweets: syn.retweet_count || 0,
      replies: syn.reply_count || 0,
      quotes: 0,
      bookmarks: 0,
      views: syn.views?.count ? parseInt(syn.views.count, 10) : 0,
    },
    media: [...photos, ...videos],
    cdnUrlsList,
    rawJson: syn,
  };
}

// API Routes

/**
 * POST /api/extract
 * Extracts Twitter metadata & direct media CDN URLs
 */
app.post(["/api/extract", "/extract"], async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Please provide a valid Twitter/X post URL." });
    }

    let targetUrl = url.trim();

    // If shorten t.co URL, attempt resolve
    if (targetUrl.includes("t.co/")) {
      try {
        const headRes = await fetch(targetUrl, { method: "HEAD", redirect: "follow" });
        if (headRes.url) {
          targetUrl = headRes.url;
        }
      } catch (e) {
        // proceed with original
      }
    }

    const { tweetId, unwrappedVideoUrl } = extractTweetId(targetUrl);

    if (!tweetId && !unwrappedVideoUrl) {
      return res.status(400).json({
        error: "Invalid Twitter/X link or video URL. Please provide a post status link or a video twimg CDN URL.",
      });
    }

    // Direct standalone video URL handler (e.g. video.twimg.com or twitterwebviewer)
    if (!tweetId && unwrappedVideoUrl) {
      const webViewerUrl = `https://video.twitterwebviewer.com/?url=${encodeURIComponent(unwrappedVideoUrl)}`;
      const videoMedia: VideoMedia = {
        id: `video_direct_${Date.now()}`,
        type: "video",
        url: unwrappedVideoUrl,
        thumbnailUrl: "",
        variants: [
          {
            url: unwrappedVideoUrl,
            contentType: "video/mp4",
            quality: "Direct CDN MP4 Video",
          },
        ],
      };

      const normalized: ExtractedTweetData = {
        id: "direct_video",
        url: targetUrl,
        text: `Direct X/Twitter CDN Video Asset (${unwrappedVideoUrl.split("/").pop() || "video.mp4"})`,
        createdAt: new Date().toISOString(),
        author: {
          name: "X Media Asset",
          handle: "twimg_cdn",
          avatarUrl: "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
          verified: true,
          verifiedType: "blue",
        },
        metrics: { likes: 0, retweets: 0, replies: 0, quotes: 0, bookmarks: 0, views: 0 },
        media: [videoMedia],
        cdnUrlsList: [
          {
            category: "Video MP4",
            label: "Direct Video CDN URL",
            url: unwrappedVideoUrl,
          },
          {
            category: "Video MP4",
            label: "Twitter Web Viewer Player",
            url: webViewerUrl,
          },
        ],
        rawJson: { url: targetUrl, unwrappedVideoUrl, webViewerUrl },
      };

      return res.json({ success: true, data: normalized });
    }

    // 1. Try FixTweet API first
    if (tweetId) {
      try {
        const fxRes = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
        });
        if (fxRes.ok) {
          const fxData = await fxRes.json();
          if (fxData && (fxData.code === 200 || fxData.tweet)) {
            const normalized = normalizeFixTweetData(fxData, targetUrl);
            return res.json({ success: true, data: normalized });
          }
        }
      } catch (err) {
        console.warn("FixTweet API fetch error, falling back:", err);
      }

      // 2. Fallback to Twitter Syndication API
      try {
        const synRes = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=1`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
        });
        if (synRes.ok) {
          const synData = await synRes.json();
          if (synData && synData.id_str) {
            const normalized = normalizeSyndicationData(synData, targetUrl);
            return res.json({ success: true, data: normalized });
          }
        }
      } catch (err) {
        console.warn("Syndication API fetch error, falling back:", err);
      }

      // 3. Fallback to VxTwitter API
      try {
        const vxRes = await fetch(`https://api.vxtwitter.com/status/${tweetId}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
        });
        if (vxRes.ok) {
          const vxData = await vxRes.json();
          if (vxData && vxData.tweet_ID) {
            const fxFormat = {
              code: 200,
              tweet: {
                id: vxData.tweet_ID,
                url: vxData.tweetURL || targetUrl,
                text: vxData.text,
                created_at: vxData.date,
                created_timestamp: vxData.date_epoch,
                author: {
                  name: vxData.user_name,
                  screen_name: vxData.user_screen_name,
                  avatar_url: vxData.user_profile_image_url,
                },
                likes: vxData.likes,
                retweets: vxData.retweets,
                replies: vxData.replies,
                views: vxData.views,
                media: {
                  photos: (vxData.mediaURLs || [])
                    .filter((m: string) => !m.endsWith(".mp4"))
                    .map((m: string) => ({ url: m })),
                  videos: (vxData.mediaURLs || [])
                    .filter((m: string) => m.endsWith(".mp4"))
                    .map((m: string) => ({
                      url: m,
                      variants: [{ url: m, content_type: "video/mp4", quality: "HD MP4" }],
                    })),
                },
              },
            };
            const normalized = normalizeFixTweetData(fxFormat, targetUrl);
            return res.json({ success: true, data: normalized });
          }
        }
      } catch (err) {
        console.warn("VxTwitter API fetch error:", err);
      }
    }

    // Fallback if unwrappedVideoUrl exists
    if (unwrappedVideoUrl) {
      const webViewerUrl = `https://video.twitterwebviewer.com/?url=${encodeURIComponent(unwrappedVideoUrl)}`;
      const videoMedia: VideoMedia = {
        id: `video_fallback_${Date.now()}`,
        type: "video",
        url: unwrappedVideoUrl,
        thumbnailUrl: "",
        variants: [{ url: unwrappedVideoUrl, contentType: "video/mp4", quality: "Direct Video" }],
      };
      const normalized: ExtractedTweetData = {
        id: tweetId || "video_post",
        url: targetUrl,
        text: `Extracted X Video Asset`,
        createdAt: new Date().toISOString(),
        author: {
          name: "X User",
          handle: "twitter_user",
          avatarUrl: "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
          verified: false,
        },
        metrics: { likes: 0, retweets: 0, replies: 0, quotes: 0, bookmarks: 0, views: 0 },
        media: [videoMedia],
        cdnUrlsList: [
          { category: "Video MP4", label: "Direct MP4 URL", url: unwrappedVideoUrl },
          { category: "Video MP4", label: "Twitter Web Viewer Player", url: webViewerUrl },
        ],
        rawJson: { url: targetUrl, unwrappedVideoUrl },
      };
      return res.json({ success: true, data: normalized });
    }

    return res.status(404).json({
      error: "Unable to extract tweet metadata. The post might be private, deleted, or temporarily unavailable.",
    });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return res.status(500).json({ error: error.message || "Server error while extracting metadata." });
  }
});

/**
 * GET /api/download
 * Proxy endpoint to force download media files with proper headers
 */
app.get(["/api/download", "/download"], async (req, res) => {
  try {
    const fileUrl = req.query.url as string;
    const requestedName = (req.query.filename as string) || "media_file";

    if (!fileUrl) {
      return res.status(400).send("Missing file URL");
    }

    const response = await fetch(fileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch target media asset.");
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(requestedName)}"`);

    // Stream body to client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    console.error("Download proxy error:", err);
    res.status(500).send("Error streaming media download.");
  }
});

/**
 * POST /api/analyze-gemini
 * Server-side Gemini AI analysis of tweet content & metadata
 */
app.post(["/api/analyze-gemini", "/analyze-gemini"], async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured in environment variables.",
      });
    }

    const { tweetText, author, metrics, hasMedia } = req.body;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze this Twitter/X post and return a clean JSON summary object:
Post Text: "${tweetText}"
Author: ${author?.name} (@${author?.handle})
Likes: ${metrics?.likes}, Retweets: ${metrics?.retweets}, Views: ${metrics?.views}
Has Media: ${hasMedia ? "Yes" : "No"}

Respond strictly with a valid JSON object matching this TypeScript format:
{
  "summary": "1-2 sentence executive summary of the tweet's core message",
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "topics": ["Array of 3-5 key topics/entities mentioned"],
  "keyTakeaways": ["2-3 concise bullet points"],
  "suggestedTags": ["3-5 relevant hashtags"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const parsed: GeminiAnalysisResult = JSON.parse(resultText);
    return res.json({ success: true, analysis: parsed });
  } catch (err: any) {
    console.error("Gemini analysis error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate AI analysis." });
  }
});

export default app;

/**
 * Start Server & Vite Setup
 */
async function startServer() {
  // If running in Vercel serverless environment, Vercel handles the server execution
  if (process.env.VERCEL) {
    return;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
