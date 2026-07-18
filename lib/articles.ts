import type { Element, Properties, Root, RootContent, Text } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { ApiError, isRecord } from "@/lib/api";
import type { ArticleSaveRequest } from "@/types/library";

export const MAX_ARTICLE_HTML_BYTES = 5 * 1024 * 1024;
export const SEARCH_CHUNK_BYTES = 48 * 1024;

const TRACKING_PARAMETERS = new Set([
  "_ga",
  "_gl",
  "dclid",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "ref_src",
  "twclid",
]);

const ARTICLE_TAGS = [
  "a",
  "abbr",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "br",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "img",
  "ins",
  "kbd",
  "li",
  "main",
  "mark",
  "math",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mi",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mprescripts",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msubsup",
  "msup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "nav",
  "none",
  "ol",
  "p",
  "picture",
  "pre",
  "q",
  "s",
  "samp",
  "section",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
];

const ARTICLE_TAG_SET = new Set(ARTICLE_TAGS);

const DROP_CONTENT_TAGS = new Set([
  "iframe",
  "noscript",
  "object",
  "script",
  "style",
  "svg",
  "template",
]);

// hast normalizes HTML attribute names into DOM-style property names.
const ARTICLE_PROPERTIES = new Set([
  "alt",
  "ariaLabel",
  "cite",
  "colSpan",
  "controls",
  "dateTime",
  "decoding",
  "height",
  "href",
  "kind",
  "label",
  "loading",
  "open",
  "poster",
  "preload",
  "referrerPolicy",
  "rel",
  "reversed",
  "rowSpan",
  "scope",
  "accent",
  "accentUnder",
  "columnAlign",
  "columnSpacing",
  "display",
  "fence",
  "form",
  "lineThickness",
  "lspace",
  "mathVariant",
  "notation",
  "rowAlign",
  "rowSpacing",
  "rspace",
  "scriptLevel",
  "separator",
  "stretchy",
  "symmetric",
  "span",
  "src",
  "srcSet",
  "start",
  "target",
  "title",
  "type",
  "value",
  "width",
]);

export interface ValidatedArticleSnapshot {
  html: string;
  plainText: string;
  contentHash: string;
  contentSize: number;
  fingerprint: string;
  sourceUrl: string;
  canonicalUrl: string;
  normalizedSourceUrl: string;
  normalizedCanonicalUrl: string;
  legacyMatchUrls: string[];
  title: string;
  author: string | null;
  description: string | null;
  siteName: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  language: string | null;
  wordCount: number;
  parseDurationMs: number | null;
}

export function normalizeUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ApiError(422, "invalid_url", "Article URLs must be valid HTTP(S) URLs");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ApiError(422, "invalid_url", "Article URLs must use HTTP or HTTPS");
  }

  url.username = "";
  url.password = "";
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";
  if ((url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")) {
    url.port = "";
  }

  const parameters = Array.from(url.searchParams.entries())
    .filter(([name]) => {
      const lower = name.toLowerCase();
      return !lower.startsWith("utm_") && !TRACKING_PARAMETERS.has(lower);
    })
    .sort(([leftName, leftValue], [rightName, rightValue]) =>
      leftName.localeCompare(rightName) || leftValue.localeCompare(rightValue),
    );
  url.search = "";
  for (const [name, parameterValue] of parameters) {
    url.searchParams.append(name, parameterValue);
  }

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

function optionalString(
  value: unknown,
  field: string,
  maxLength: number,
): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new ApiError(422, "invalid_article", `${field} must be a string`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ApiError(422, "invalid_article", `${field} is too long`);
  }
  return normalized || null;
}

function optionalHttpsUrl(value: unknown, field: string) {
  const candidate = optionalString(value, field, 4096);
  if (!candidate) return null;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new ApiError(422, "invalid_article", `${field} must be a valid HTTPS URL`);
  }
  if (url.protocol !== "https:") {
    throw new ApiError(422, "invalid_article", `${field} must use HTTPS`);
  }
  return url.toString();
}

function optionalInteger(
  value: unknown,
  field: string,
  maximum: number,
): number | null {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > maximum) {
    throw new ApiError(422, "invalid_article", `${field} must be a bounded integer`);
  }
  return value as number;
}

function isSafeLink(value: string) {
  if (value.startsWith("#")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function isSafeMediaUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeSrcSet(value: string) {
  return value.split(",").every((candidate) => {
    const [url] = candidate.trim().split(/\s+/, 1);
    return Boolean(url) && isSafeMediaUrl(url);
  });
}

function cleanPropertyValue(value: unknown): Properties[string] | undefined {
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) {
    const clean = value.filter(
      (item): item is string | number =>
        typeof item === "string" ||
        (typeof item === "number" && Number.isFinite(item)),
    );
    return clean.length > 0 ? clean : undefined;
  }
  return undefined;
}

function sanitizeProperties(tagName: string, properties: Properties): Properties {
  const sanitized: Properties = {};

  for (const [name, value] of Object.entries(properties)) {
    if (!ARTICLE_PROPERTIES.has(name)) continue;
    if (
      name === "controls" ||
      name === "decoding" ||
      name === "loading" ||
      name === "preload" ||
      name === "referrerPolicy" ||
      name === "rel" ||
      name === "target"
    ) {
      continue;
    }

    if (name === "href" || name === "cite") {
      if (typeof value === "string" && isSafeLink(value)) sanitized[name] = value;
      continue;
    }
    if (name === "src" || name === "poster") {
      if (typeof value === "string" && isSafeMediaUrl(value)) sanitized[name] = value;
      continue;
    }
    if (name === "srcSet") {
      if (typeof value === "string" && isSafeSrcSet(value)) sanitized[name] = value;
      continue;
    }

    const clean = cleanPropertyValue(value);
    if (clean !== undefined) sanitized[name] = clean;
  }

  const href = sanitized.href;
  if (
    tagName === "a" &&
    typeof href === "string" &&
    (href.startsWith("http://") || href.startsWith("https://"))
  ) {
    sanitized.target = "_blank";
    sanitized.rel = ["noopener", "noreferrer"];
  }

  if (tagName === "img") {
    sanitized.loading = "lazy";
    sanitized.decoding = "async";
    sanitized.referrerPolicy = "no-referrer";
  }

  if (tagName === "audio" || tagName === "video") {
    sanitized.controls = true;
    sanitized.preload = "none";
    sanitized.referrerPolicy = "no-referrer";
  }

  return sanitized;
}

function sanitizeNodes(nodes: RootContent[]): Array<Element | Text> {
  const result: Array<Element | Text> = [];

  for (const node of nodes) {
    if (node.type === "text") {
      result.push({ type: "text", value: node.value });
      continue;
    }
    if (node.type !== "element") continue;

    const tagName = node.tagName.toLowerCase();
    if (DROP_CONTENT_TAGS.has(tagName)) continue;

    const children = sanitizeNodes(node.children);
    if (!ARTICLE_TAG_SET.has(tagName)) {
      result.push(...children);
      continue;
    }

    result.push({
      type: "element",
      tagName,
      properties: sanitizeProperties(tagName, node.properties),
      children,
    });
  }

  return result;
}

function sanitizedArticleTree(input: string): Root {
  const parsed = fromHtml(input, { fragment: true });
  return { type: "root", children: sanitizeNodes(parsed.children) };
}

export function sanitizeArticleHtml(input: string) {
  return toHtml(sanitizedArticleTree(input)).trim();
}

export function htmlToPlainText(html: string) {
  const text: string[] = [];
  const collect = (nodes: RootContent[]) => {
    for (const node of nodes) {
      if (node.type === "text") text.push(node.value);
      else if (node.type === "element") collect(node.children);
    }
  };
  collect(sanitizedArticleTree(html).children);
  return text.join(" ").replace(/\s+/g, " ").trim();
}

export function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function countWords(value: string) {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
    return Array.from(segmenter.segment(value)).filter((segment) => segment.isWordLike).length;
  }
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function chunkUnicodeText(value: string, maxBytes = SEARCH_CHUNK_BYTES) {
  if (!Number.isInteger(maxBytes) || maxBytes < 4) {
    throw new Error("maxBytes must be an integer of at least four bytes");
  }
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;

  const pushCurrent = () => {
    const chunk = current.trim();
    if (chunk) chunks.push(chunk);
    current = "";
    currentBytes = 0;
  };
  const appendUnit = (unit: string) => {
    const unitBytes = encoder.encode(unit).byteLength;
    if (current && currentBytes + unitBytes > maxBytes) pushCurrent();
    current += unit;
    currentBytes += unitBytes;
  };

  for (const token of normalized.match(/\S+\s*/g) ?? []) {
    const tokenBytes = encoder.encode(token).byteLength;
    if (tokenBytes <= maxBytes) {
      if (current && currentBytes + tokenBytes > maxBytes) pushCurrent();
      current += token;
      currentBytes += tokenBytes;
      continue;
    }

    pushCurrent();
    const graphemes = typeof Intl.Segmenter === "function"
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(token.trimEnd()),
          ({ segment }) => segment,
        )
      : Array.from(token.trimEnd());
    for (const grapheme of graphemes) {
      if (encoder.encode(grapheme).byteLength <= maxBytes) {
        appendUnit(grapheme);
      } else {
        for (const character of Array.from(grapheme)) appendUnit(character);
      }
    }
    pushCurrent();
  }
  pushCurrent();
  return chunks.filter(Boolean);
}

export function buildSearchDocuments({
  kind,
  entityId,
  userId,
  title,
  plainText,
}: {
  kind: "article" | "excerpt";
  entityId: string;
  userId: string;
  title: string;
  plainText: string;
}) {
  const chunks = kind === "article" ? chunkUnicodeText(plainText) : [plainText.trim()];
  return chunks.filter(Boolean).map((content, chunkIndex) => ({
    id: `${kind}:${entityId}:${chunkIndex}`,
    userId,
    kind,
    entityId,
    chunkIndex,
    title,
    content,
    articleId: kind === "article" ? entityId : null,
    excerptId: kind === "excerpt" ? entityId : null,
  }));
}

export async function validateArticleSaveRequest(
  value: unknown,
): Promise<ValidatedArticleSnapshot> {
  if (!isRecord(value)) {
    throw new ApiError(400, "invalid_request", "Request body must be an object");
  }
  if (typeof value.html !== "string" || typeof value.sourceUrl !== "string") {
    throw new ApiError(422, "invalid_article", "html and sourceUrl are required");
  }

  const title = optionalString(value.title, "title", 500);
  if (!title) throw new ApiError(422, "invalid_article", "title is required");

  const sourceUrlInput = optionalString(value.sourceUrl, "sourceUrl", 4096)!;
  const canonicalCandidate = optionalString(value.canonicalUrl, "canonicalUrl", 4096);
  const normalizedSourceUrl = normalizeUrl(sourceUrlInput);
  const normalizedCanonicalUrl = normalizeUrl(canonicalCandidate ?? sourceUrlInput);
  const html = sanitizeArticleHtml(value.html);
  const contentSize = utf8ByteLength(html);
  if (contentSize > MAX_ARTICLE_HTML_BYTES) {
    throw new ApiError(413, "article_too_large", "Sanitized article content exceeds 5 MiB");
  }
  const plainText = htmlToPlainText(html);
  if (!plainText) {
    throw new ApiError(422, "empty_article", "No readable article content remained after sanitization");
  }

  const suppliedWordCount = optionalInteger(value.wordCount, "wordCount", 10_000_000);
  const snapshot = {
    html,
    plainText,
    sourceUrl: normalizedSourceUrl,
    canonicalUrl: normalizedCanonicalUrl,
    normalizedSourceUrl,
    normalizedCanonicalUrl,
    // Migration 0003 could only copy legacy excerpt URLs verbatim. Keep the
    // validated incoming spellings long enough to link exact historical rows.
    legacyMatchUrls: Array.from(new Set([
      sourceUrlInput,
      ...(canonicalCandidate ? [canonicalCandidate] : []),
    ])),
    title,
    author: optionalString(value.author, "author", 300),
    description: optionalString(value.description, "description", 2_000),
    siteName: optionalString(value.site, "site", 300),
    publishedAt: optionalString(value.publishedAt, "publishedAt", 100),
    imageUrl: optionalHttpsUrl(value.imageUrl, "imageUrl"),
    faviconUrl: optionalHttpsUrl(value.faviconUrl, "faviconUrl"),
    language: optionalString(value.language, "language", 35),
    wordCount: suppliedWordCount ?? countWords(plainText),
    parseDurationMs: optionalInteger(value.parseDurationMs, "parseDurationMs", 600_000),
  } satisfies Omit<ValidatedArticleSnapshot, "contentHash" | "contentSize" | "fingerprint">;

  const contentHash = await sha256Hex(html);
  const fingerprint = await sha256Hex(JSON.stringify({
    html,
    sourceUrl: snapshot.normalizedSourceUrl,
    canonicalUrl: snapshot.normalizedCanonicalUrl,
    title: snapshot.title,
    author: snapshot.author,
    description: snapshot.description,
    siteName: snapshot.siteName,
    publishedAt: snapshot.publishedAt,
    imageUrl: snapshot.imageUrl,
    faviconUrl: snapshot.faviconUrl,
    language: snapshot.language,
    wordCount: snapshot.wordCount,
  }));

  return { ...snapshot, contentHash, contentSize, fingerprint };
}

export function articleContentKey(userId: string, articleId: string, contentHash: string) {
  const safeUserId = encodeURIComponent(userId);
  return `articles/${safeUserId}/${articleId}/${contentHash}.html`;
}

export function asArticleSaveRequest(value: ArticleSaveRequest) {
  return value;
}
