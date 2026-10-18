-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issueNumber" TEXT,
    "publicationDate" TIMESTAMP(3),
    "author" TEXT,
    "genre" TEXT,
    "type" TEXT NOT NULL,
    "language" TEXT,
    "coverImage" TEXT,
    "photosJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Publication_userId_updatedAt_idx" ON "Publication"("userId", "updatedAt");
CREATE INDEX "Publication_userId_title_idx" ON "Publication"("userId", "title");
CREATE INDEX "Publication_userId_author_idx" ON "Publication"("userId", "author");
CREATE INDEX "Publication_userId_genre_idx" ON "Publication"("userId", "genre");
CREATE INDEX "Publication_userId_type_idx" ON "Publication"("userId", "type");

ALTER TABLE "Publication" ADD CONSTRAINT "Publication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
