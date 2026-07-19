-- Prisma's D1 adapter infers ISO-looking strings as DateTime values. Normalize
-- parseable legacy metadata before the Prisma fields switch from String to
-- DateTime, and discard values that cannot safely be represented as dates.
UPDATE "Article"
SET "published_at" = CASE
  WHEN datetime("published_at") IS NULL THEN NULL
  ELSE strftime('%Y-%m-%dT%H:%M:%fZ', "published_at")
END
WHERE "published_at" IS NOT NULL;

UPDATE "ArticleVersion"
SET "published_at" = CASE
  WHEN datetime("published_at") IS NULL THEN NULL
  ELSE strftime('%Y-%m-%dT%H:%M:%fZ', "published_at")
END
WHERE "published_at" IS NOT NULL;
