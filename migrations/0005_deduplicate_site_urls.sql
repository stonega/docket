PRAGMA foreign_keys = ON;

-- Article saves have always stored root URLs with a trailing slash, while the
-- excerpt flow previously omitted it. Canonicalize those legacy root rows
-- before merging duplicates and enforcing uniqueness.
UPDATE "Site"
SET "url" = "url" || '/'
WHERE (
    "url" LIKE 'https://%'
    AND instr(substr("url", 9), '/') = 0
  )
  OR (
    "url" LIKE 'http://%'
    AND instr(substr("url", 8), '/') = 0
  );

CREATE TABLE "_SiteUrlDeduplication" (
  "duplicate_id" TEXT NOT NULL PRIMARY KEY,
  "keeper_id" TEXT NOT NULL
);

INSERT INTO "_SiteUrlDeduplication" ("duplicate_id", "keeper_id")
SELECT
  duplicate."id",
  (
    SELECT keeper."id"
    FROM "Site" AS keeper
    WHERE keeper."user_id" = duplicate."user_id"
      AND keeper."url" = duplicate."url"
    ORDER BY keeper."update_at" DESC, keeper."create_at" ASC, keeper."id" ASC
    LIMIT 1
  )
FROM "Site" AS duplicate
WHERE duplicate."id" <> (
  SELECT keeper."id"
  FROM "Site" AS keeper
  WHERE keeper."user_id" = duplicate."user_id"
    AND keeper."url" = duplicate."url"
  ORDER BY keeper."update_at" DESC, keeper."create_at" ASC, keeper."id" ASC
  LIMIT 1
);

UPDATE "Excerpt"
SET "site_id" = (
  SELECT mapping."keeper_id"
  FROM "_SiteUrlDeduplication" AS mapping
  WHERE mapping."duplicate_id" = "Excerpt"."site_id"
)
WHERE "site_id" IN (
  SELECT "duplicate_id" FROM "_SiteUrlDeduplication"
);

UPDATE "Article"
SET "site_id" = (
  SELECT mapping."keeper_id"
  FROM "_SiteUrlDeduplication" AS mapping
  WHERE mapping."duplicate_id" = "Article"."site_id"
)
WHERE "site_id" IN (
  SELECT "duplicate_id" FROM "_SiteUrlDeduplication"
);

DELETE FROM "Site"
WHERE "id" IN (
  SELECT "duplicate_id" FROM "_SiteUrlDeduplication"
);

DROP TABLE "_SiteUrlDeduplication";

CREATE UNIQUE INDEX "Site_user_id_url_key"
  ON "Site" ("user_id", "url");
