export interface ArticleSaveRequest {
  html: string;
  sourceUrl: string;
  canonicalUrl?: string | null;
  title: string;
  author?: string | null;
  description?: string | null;
  site?: string | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
  faviconUrl?: string | null;
  language?: string | null;
  wordCount?: number | null;
  parseDurationMs?: number | null;
}

export interface ArticleSiteSummary {
  id: string;
  title: string;
  url: string;
}

export interface ArticleSummary {
  id: string;
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  author: string | null;
  description: string | null;
  siteName: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  language: string | null;
  wordCount: number;
  savedAt: string;
  updatedAt: string;
  versionCount: number;
  excerptCount: number;
  site: ArticleSiteSummary;
}

export interface ArticleVersionSummary {
  id: string;
  savedAt: string;
  title: string;
  author: string | null;
  wordCount: number;
  contentHash: string;
  contentSize: number;
  isCurrent: boolean;
  restoredFromVersionId: string | null;
}

export interface ExcerptWithArticle {
  id: string;
  createAt: string;
  url: string;
  canonicalUrl: string | null;
  siteId: string;
  content: string;
  source: string | null;
  sourceId: string | null;
  article: { id: string; title: string } | null;
}

export interface ArticleDetail extends ArticleSummary {
  currentVersion: ArticleVersionSummary;
  versions: ArticleVersionSummary[];
  excerpts: ExcerptWithArticle[];
}

export type LibrarySearchResult =
  | {
      kind: "article";
      id: string;
      title: string;
      titleSnippet: string;
      snippet: string;
      sourceUrl: string;
      imageUrl: string | null;
      siteTitle: string;
      wordCount: number;
      updatedAt: string;
    }
  | {
      kind: "excerpt";
      id: string;
      title: string;
      titleSnippet: string;
      snippet: string;
      sourceUrl: string;
      createdAt: string;
      article: { id: string; title: string } | null;
    };

export type ArticleSaveOutcome = "created" | "versioned" | "unchanged";

export interface ArticleSaveResponse {
  outcome: ArticleSaveOutcome;
  article: ArticleSummary;
  versionId: string;
  linkedExcerptCount: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
