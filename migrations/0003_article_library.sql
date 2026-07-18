PRAGMA foreign_keys = ON;

CREATE TABLE "Article" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "update_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'DELETING')),
  "source_url" TEXT NOT NULL,
  "canonical_url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "author" TEXT,
  "description" TEXT,
  "site_name" TEXT,
  "published_at" TEXT,
  "image_url" TEXT,
  "favicon_url" TEXT,
  "language" TEXT,
  "word_count" INTEGER NOT NULL DEFAULT 0,
  "parse_duration_ms" INTEGER,
  "current_version_id" TEXT NOT NULL,
  "current_content_key" TEXT NOT NULL,
  "current_content_hash" TEXT NOT NULL,
  "current_content_size" INTEGER NOT NULL,
  "current_fingerprint" TEXT NOT NULL,
  CONSTRAINT "Article_site_id_fkey"
    FOREIGN KEY ("site_id") REFERENCES "Site" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ArticleVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "article_id" TEXT NOT NULL,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "restored_from_version_id" TEXT,
  "previous_version_id" TEXT,
  "source_url" TEXT NOT NULL,
  "canonical_url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "author" TEXT,
  "description" TEXT,
  "site_name" TEXT,
  "published_at" TEXT,
  "image_url" TEXT,
  "favicon_url" TEXT,
  "language" TEXT,
  "word_count" INTEGER NOT NULL DEFAULT 0,
  "parse_duration_ms" INTEGER,
  "content_key" TEXT NOT NULL,
  "content_hash" TEXT NOT NULL,
  "content_size" INTEGER NOT NULL,
  "fingerprint" TEXT NOT NULL,
  CONSTRAINT "ArticleVersion_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "Article" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ArticleUrlAlias" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "article_id" TEXT NOT NULL,
  "normalized_url" TEXT NOT NULL,
  "kind" TEXT NOT NULL CHECK ("kind" IN ('source', 'canonical')),
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArticleUrlAlias_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "Article" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Excerpt" ADD COLUMN "article_id" TEXT
  REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Excerpt" ADD COLUMN "canonical_url" TEXT;
ALTER TABLE "Excerpt" ADD COLUMN "normalized_page_key" TEXT;

UPDATE "Excerpt" SET "normalized_page_key" = "url"
WHERE "normalized_page_key" IS NULL;

CREATE TABLE "SearchDocument" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "update_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL CHECK ("kind" IN ('article', 'excerpt')),
  "entity_id" TEXT NOT NULL,
  "chunk_index" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "article_id" TEXT,
  "excerpt_id" TEXT,
  CONSTRAINT "SearchDocument_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "Article" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SearchDocument_excerpt_id_fkey"
    FOREIGN KEY ("excerpt_id") REFERENCES "Excerpt" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CHECK (
    ("kind" = 'article' AND "article_id" IS NOT NULL AND "excerpt_id" IS NULL)
    OR
    ("kind" = 'excerpt' AND "excerpt_id" IS NOT NULL AND "article_id" IS NULL)
  )
);

INSERT INTO "SearchDocument" (
  "id", "create_at", "update_at", "user_id", "kind", "entity_id",
  "chunk_index", "title", "content", "excerpt_id"
)
SELECT
  'excerpt:' || excerpt."id" || ':0',
  excerpt."create_at",
  excerpt."create_at",
  excerpt."user_id",
  'excerpt',
  excerpt."id",
  0,
  site."title",
  excerpt."content",
  excerpt."id"
FROM "Excerpt" AS excerpt
INNER JOIN "Site" AS site ON site."id" = excerpt."site_id";

CREATE VIRTUAL TABLE "SearchDocument_fts" USING fts5(
  "id" UNINDEXED,
  "user_id" UNINDEXED,
  "kind" UNINDEXED,
  "entity_id" UNINDEXED,
  "title",
  "content"
);

INSERT INTO "SearchDocument_fts" (
  rowid, "id", "user_id", "kind", "entity_id", "title", "content"
)
SELECT
  rowid, "id", "user_id", "kind", "entity_id", "title", "content"
FROM "SearchDocument";

CREATE TRIGGER "SearchDocument_fts_insert"
AFTER INSERT ON "SearchDocument"
BEGIN
  INSERT INTO "SearchDocument_fts" (
    rowid, "id", "user_id", "kind", "entity_id", "title", "content"
  ) VALUES (
    new.rowid, new."id", new."user_id", new."kind", new."entity_id",
    new."title", new."content"
  );
END;

CREATE TRIGGER "SearchDocument_fts_delete"
AFTER DELETE ON "SearchDocument"
BEGIN
  DELETE FROM "SearchDocument_fts" WHERE rowid = old.rowid;
END;

CREATE TRIGGER "SearchDocument_fts_update"
AFTER UPDATE OF "user_id", "kind", "entity_id", "title", "content"
ON "SearchDocument"
BEGIN
  DELETE FROM "SearchDocument_fts" WHERE rowid = old.rowid;
  INSERT INTO "SearchDocument_fts" (
    rowid, "id", "user_id", "kind", "entity_id", "title", "content"
  ) VALUES (
    new.rowid, new."id", new."user_id", new."kind", new."entity_id",
    new."title", new."content"
  );
END;

-- Keep article history linear and prevent saves that started before deletion
-- from appending a version after the article has entered DELETING state.
CREATE TRIGGER "ArticleVersion_current_guard"
BEFORE INSERT ON "ArticleVersion"
WHEN NOT EXISTS (
  SELECT 1
  FROM "Article"
  WHERE "Article"."id" = new."article_id"
    AND "Article"."status" = 'ACTIVE'
    AND (
      (new."previous_version_id" IS NULL AND "Article"."current_version_id" = new."id")
      OR
      (new."previous_version_id" IS NOT NULL
        AND "Article"."current_version_id" = new."previous_version_id")
    )
)
BEGIN
  SELECT RAISE(ABORT, 'article_version_conflict');
END;

CREATE INDEX "Article_user_id_status_update_at_idx"
  ON "Article" ("user_id", "status", "update_at");
CREATE INDEX "Article_site_id_status_update_at_idx"
  ON "Article" ("site_id", "status", "update_at");
CREATE INDEX "Article_current_version_id_idx"
  ON "Article" ("current_version_id");
CREATE UNIQUE INDEX "ArticleVersion_article_id_previous_version_id_key"
  ON "ArticleVersion" ("article_id", "previous_version_id");
CREATE INDEX "ArticleVersion_article_id_create_at_idx"
  ON "ArticleVersion" ("article_id", "create_at");
CREATE INDEX "ArticleVersion_restored_from_version_id_idx"
  ON "ArticleVersion" ("restored_from_version_id");
CREATE UNIQUE INDEX "ArticleUrlAlias_user_id_normalized_url_key"
  ON "ArticleUrlAlias" ("user_id", "normalized_url");
CREATE INDEX "ArticleUrlAlias_article_id_idx"
  ON "ArticleUrlAlias" ("article_id");
CREATE INDEX "Excerpt_article_id_idx" ON "Excerpt" ("article_id");
CREATE INDEX "Excerpt_user_id_normalized_page_key_idx"
  ON "Excerpt" ("user_id", "normalized_page_key");
CREATE UNIQUE INDEX "SearchDocument_kind_entity_id_chunk_index_key"
  ON "SearchDocument" ("kind", "entity_id", "chunk_index");
CREATE INDEX "SearchDocument_user_id_kind_entity_id_idx"
  ON "SearchDocument" ("user_id", "kind", "entity_id");
CREATE INDEX "SearchDocument_article_id_idx" ON "SearchDocument" ("article_id");
CREATE INDEX "SearchDocument_excerpt_id_idx" ON "SearchDocument" ("excerpt_id");
