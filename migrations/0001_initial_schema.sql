PRAGMA foreign_keys = ON;

CREATE TABLE "BasicSite" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "title" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "Site" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "update_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "title" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "user_id" TEXT NOT NULL
);

CREATE TABLE "Excerpt" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "url" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "source" TEXT,
  "source_id" TEXT,
  "user_id" TEXT NOT NULL,
  CONSTRAINT "Excerpt_site_id_fkey"
    FOREIGN KEY ("site_id") REFERENCES "Site" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Notion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id" TEXT NOT NULL,
  "page_id" TEXT NOT NULL,
  "database_id" TEXT NOT NULL
);

CREATE INDEX "Site_user_id_idx" ON "Site" ("user_id");
CREATE INDEX "Excerpt_site_id_idx" ON "Excerpt" ("site_id");
CREATE INDEX "Excerpt_user_id_idx" ON "Excerpt" ("user_id");
CREATE INDEX "Excerpt_user_id_site_id_idx" ON "Excerpt" ("user_id", "site_id");
CREATE INDEX "Excerpt_source_id_idx" ON "Excerpt" ("source_id");
CREATE INDEX "Notion_user_id_idx" ON "Notion" ("user_id");
