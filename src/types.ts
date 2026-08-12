export interface MediaVariant {
  url: string;
  contentType: string;
  bitrate?: number;
  quality: string; // e.g. "1080p", "720p", "480p", "360p", "m3u8"
  width?: number;
  height?: number;
}

export interface PhotoMedia {
  id: string;
  type: 'photo';
  url: string; // orig/large CDN url
  thumbnailUrl: string;
  width?: number;
  height?: number;
  altText?: string;
}

export interface VideoMedia {
  id: string;
  type: 'video' | 'gif';
  url: string; // Highest quality MP4 URL
  thumbnailUrl: string;
  duration?: number; // seconds
  width?: number;
  height?: number;
  variants: MediaVariant[];
}

export type TweetMedia = PhotoMedia | VideoMedia;

export interface AuthorInfo {
  name: string;
  handle: string; // e.g. "Sunil_Goriyaa"
  avatarUrl: string;
  bannerUrl?: string;
  verified: boolean;
  verifiedType?: 'blue' | 'business' | 'government' | 'none';
  bio?: string;
  followers?: number;
  following?: number;
  tweetsCount?: number;
}

export interface EngagementMetrics {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  views: number;
}

export interface PollOption {
  label: string;
  votes: number;
  percentage: number;
}

export interface PollInfo {
  options: PollOption[];
  totalVotes: number;
}

export interface ExtractedTweetData {
  id: string;
  url: string;
  text: string;
  createdAt: string; // ISO or formatted
  createdTimestamp?: number;
  lang?: string;
  author: AuthorInfo;
  metrics: EngagementMetrics;
  media: TweetMedia[];
  poll?: PollInfo;
  quotedTweet?: ExtractedTweetData;
  cdnUrlsList: {
    category: 'Photo' | 'Video MP4' | 'Video Thumbnail' | 'Avatar' | 'Banner' | 'HLS Stream';
    label: string;
    url: string;
  }[];
  rawJson: any;
}

export interface ExtractionHistoryItem {
  id: string;
  url: string;
  authorName: string;
  authorHandle: string;
  textSnippet: string;
  thumbnailUrl?: string;
  extractedAt: number;
  mediaCount: number;
}

export interface GeminiAnalysisResult {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  topics: string[];
  keyTakeaways: string[];
  suggestedTags: string[];
}
