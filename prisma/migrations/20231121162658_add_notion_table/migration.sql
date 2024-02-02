-- CreateTable
CREATE TABLE "Notion" (
    "id" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "database_id" TEXT NOT NULL,

    CONSTRAINT "Notion_pkey" PRIMARY KEY ("id")
);
