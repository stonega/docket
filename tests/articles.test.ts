import {
  MAX_ARTICLE_HTML_BYTES,
  articleContentKey,
  buildSearchDocuments,
  chunkUnicodeText,
  normalizeUrl,
  sanitizeArticleHtml,
  sha256Hex,
  utf8ByteLength,
  validateArticleSaveRequest,
} from "../lib/articles";
import { describe, expect, test } from "vitest";
import { toFtsQuery } from "../lib/library-search";

const validRequest = {
  html: "<article><h1>Readable copy</h1><p>A durable article body.</p></article>",
  sourceUrl: "https://Example.com:443/read/story/?utm_source=newsletter&b=2&a=1#part",
  canonicalUrl: "https://example.com/read/story?fbclid=private&a=1&b=2",
  title: "Readable copy",
};

describe("article URL identity", () => {
  test("normalizes aliases without tracking details or fragments", () => {
    expect(normalizeUrl(validRequest.sourceUrl)).toBe(
      "https://example.com/read/story?a=1&b=2",
    );
    expect(normalizeUrl("http://USER:PASS@EXAMPLE.COM:80/docs///?z=2&z=1&_ga=x")).toBe(
      "http://example.com/docs?z=1&z=2",
    );
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });

  test("rejects malformed and non-web aliases", () => {
    expect(() => normalizeUrl("javascript:alert(1)")).toThrow(/HTTP or HTTPS/);
    expect(() => normalizeUrl("not a URL")).toThrow(/valid HTTP\(S\)/);
  });
});

describe("article sanitization", () => {
  test("keeps readable structures while removing executable and identifying markup", () => {
    const sanitized = sanitizeArticleHtml(`
      <article id="private" class="publisher" onclick="steal()">
        <h2>Reference</h2>
        <p style="color:red">Read <a href="https://example.com/next">next</a>.</p>
        <pre><code>const safe = true;</code></pre>
        <table><tbody><tr><th>Key</th><td>Value</td></tr></tbody></table>
        <math display="block"><mfrac><msup><mi>x</mi><mn>2</mn></msup><mn>2</mn></mfrac></math>
        <img src="https://cdn.example.com/image.jpg" onerror="steal()">
        <video src="https://cdn.example.com/demo.mp4" autoplay></video>
        <img src="http://cdn.example.com/insecure.jpg">
        <a href="javascript:steal()">unsafe</a>
        <script>steal()</script><style>body{display:none}</style>
        <form><input name="secret"></form><iframe src="https://example.com"></iframe>
        <svg><script>steal()</script></svg>
      </article>
    `);

    expect(sanitized).toContain("<pre><code>const safe = true;</code></pre>");
    expect(sanitized).toContain("<table>");
    expect(sanitized).toContain('<math display="block"><mfrac><msup>');
    expect(sanitized).toContain(
      'href="https://example.com/next" target="_blank" rel="noopener noreferrer"',
    );
    expect(sanitized).toContain(
      'src="https://cdn.example.com/image.jpg" loading="lazy" decoding="async" referrerpolicy="no-referrer"',
    );
    expect(sanitized).toContain(
      'src="https://cdn.example.com/demo.mp4" controls preload="none" referrerpolicy="no-referrer"',
    );
    expect(sanitized).not.toContain("autoplay");
    expect(sanitized).not.toMatch(/script|style=|onclick|onerror|<form|<iframe|<svg|class=|id=/i);
    expect(sanitized).not.toContain("http://cdn.example.com/insecure.jpg");
    expect(sanitized).not.toContain("javascript:");
  });

  test("rejects empty and oversized sanitized snapshots", async () => {
    await expect(validateArticleSaveRequest({ ...validRequest, html: "<script>only code</script>" }))
      .rejects.toMatchObject({ status: 422, code: "empty_article" });

    const oversized = `<p>${"a".repeat(MAX_ARTICLE_HTML_BYTES)}</p>`;
    await expect(validateArticleSaveRequest({ ...validRequest, html: oversized }))
      .rejects.toMatchObject({ status: 413, code: "article_too_large" });
  });
});

describe("article snapshots and search documents", () => {
  test("measures UTF-8 bytes and chunks without splitting Unicode scalars", () => {
    expect(utf8ByteLength("A台🙂")).toBe(8);
    const chunks = chunkUnicodeText("alpha 台灣 🙂 e\u0301 omega", 9);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(utf8ByteLength(chunk)).toBeLessThanOrEqual(9);
      expect(chunk).not.toContain("�");
    }
    expect(chunks.join("")).toContain("台灣");
    expect(chunks.join("")).toContain("🙂");
    expect(chunks.join("")).toContain("e\u0301");
  });

  test("builds deterministic current-version search rows", () => {
    const articleRows = buildSearchDocuments({
      kind: "article",
      entityId: "article-1",
      userId: "user-1",
      title: "Unicode article",
      plainText: "台灣 article body",
    });
    const excerptRows = buildSearchDocuments({
      kind: "excerpt",
      entityId: "excerpt-1",
      userId: "user-1",
      title: "Excerpt title",
      plainText: "selected passage",
    });

    expect(articleRows[0]).toMatchObject({
      id: "article:article-1:0",
      articleId: "article-1",
      excerptId: null,
      kind: "article",
    });
    expect(excerptRows).toEqual([
      expect.objectContaining({
        id: "excerpt:excerpt-1:0",
        articleId: null,
        excerptId: "excerpt-1",
        content: "selected passage",
      }),
    ]);
  });

  test("hashes normalized snapshots and addresses bodies by content", async () => {
    const first = await validateArticleSaveRequest(validRequest);
    const identical = await validateArticleSaveRequest(validRequest);
    const changed = await validateArticleSaveRequest({
      ...validRequest,
      html: "<article><h1>Readable copy</h1><p>A changed durable article body.</p></article>",
    });

    expect(first.contentHash).toBe(await sha256Hex(first.html));
    expect(first.fingerprint).toBe(identical.fingerprint);
    expect(changed.fingerprint).not.toBe(first.fingerprint);
    expect(articleContentKey("user/one", "article-1", first.contentHash)).toBe(
      `articles/user%2Fone/article-1/${first.contentHash}.html`,
    );
  });
});

describe("library search queries", () => {
  test("builds bounded escaped FTS prefix terms", () => {
    expect(toFtsQuery("  durable   reading  ")).toBe(
      '"durable"* AND "reading"*',
    );
    expect(toFtsQuery('say"hello')).toBe('"say""hello"*');
    expect(toFtsQuery(Array.from({ length: 12 }, (_, index) => `term${index}`).join(" "))
      .split(" AND ")).toHaveLength(10);
    expect(() => toFtsQuery("x".repeat(201))).toThrow(/at most 200/);
  });
});
