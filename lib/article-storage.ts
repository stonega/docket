import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getArticleBucket() {
  const { env } = getCloudflareContext();
  return env.ARTICLE_BUCKET;
}

export async function getArticleBucketAsync() {
  const { env } = await getCloudflareContext({ async: true });
  return env.ARTICLE_BUCKET;
}

export async function putArticleHtml({
  bucket,
  key,
  html,
  language,
  contentHash,
}: {
  bucket: R2Bucket;
  key: string;
  html: string;
  language: string | null;
  contentHash: string;
}) {
  await bucket.put(key, html, {
    storageClass: "Standard",
    httpMetadata: {
      contentType: "text/html; charset=utf-8",
      ...(language ? { contentLanguage: language } : {}),
    },
    customMetadata: { contentHash },
  });
}

export async function getArticleHtml(bucket: R2Bucket, key: string) {
  const object = await bucket.get(key);
  return object ? object.text() : null;
}

export async function deleteArticleObjects(bucket: R2Bucket, keys: string[]) {
  const uniqueKeys = Array.from(new Set(keys));
  for (let offset = 0; offset < uniqueKeys.length; offset += 1_000) {
    await bucket.delete(uniqueKeys.slice(offset, offset + 1_000));
  }
}
