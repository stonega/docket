CREATE VIRTUAL TABLE "Excerpt_fts" USING fts5(
  "id" UNINDEXED,
  "user_id" UNINDEXED,
  "content"
);

INSERT INTO "Excerpt_fts" (rowid, "id", "user_id", "content")
SELECT rowid, "id", "user_id", "content" FROM "Excerpt";

CREATE TRIGGER "Excerpt_fts_insert"
AFTER INSERT ON "Excerpt"
BEGIN
  INSERT INTO "Excerpt_fts" (rowid, "id", "user_id", "content")
  VALUES (new.rowid, new."id", new."user_id", new."content");
END;

CREATE TRIGGER "Excerpt_fts_delete"
AFTER DELETE ON "Excerpt"
BEGIN
  DELETE FROM "Excerpt_fts" WHERE rowid = old.rowid;
END;

CREATE TRIGGER "Excerpt_fts_update"
AFTER UPDATE OF "content", "user_id" ON "Excerpt"
BEGIN
  DELETE FROM "Excerpt_fts" WHERE rowid = old.rowid;
  INSERT INTO "Excerpt_fts" (rowid, "id", "user_id", "content")
  VALUES (new.rowid, new."id", new."user_id", new."content");
END;
