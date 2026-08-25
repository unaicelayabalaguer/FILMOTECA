-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT NOT NULL,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseDate" TIMESTAMP(3),
    "runtime" INTEGER,
    "director" TEXT,
    "genresJson" TEXT NOT NULL DEFAULT '[]',
    "castJson" TEXT NOT NULL DEFAULT '[]',
    "overview" TEXT,
    "tmdbVoteAverage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMovie" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "physicalFormat" TEXT NOT NULL DEFAULT 'Sin formato',
    "photosJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMovie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" TEXT NOT NULL,
    "userMovieId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_title_idx" ON "Movie"("title");

-- CreateIndex
CREATE INDEX "Movie_originalTitle_idx" ON "Movie"("originalTitle");

-- CreateIndex
CREATE INDEX "Movie_releaseDate_idx" ON "Movie"("releaseDate");

-- CreateIndex
CREATE INDEX "UserMovie_userId_favorite_idx" ON "UserMovie"("userId", "favorite");

-- CreateIndex
CREATE INDEX "UserMovie_movieId_idx" ON "UserMovie"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMovie_userId_movieId_key" ON "UserMovie"("userId", "movieId");

-- CreateIndex
CREATE INDEX "WatchHistory_userMovieId_watchedAt_idx" ON "WatchHistory"("userMovieId", "watchedAt");

-- CreateIndex
CREATE INDEX "WatchHistory_rating_idx" ON "WatchHistory"("rating");

-- AddForeignKey
ALTER TABLE "UserMovie" ADD CONSTRAINT "UserMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMovie" ADD CONSTRAINT "UserMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchHistory" ADD CONSTRAINT "WatchHistory_userMovieId_fkey" FOREIGN KEY ("userMovieId") REFERENCES "UserMovie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
