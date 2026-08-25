import type { Movie, UserMovie, WatchHistory } from "@prisma/client";

export type LibraryMovie = UserMovie & {
  movie: Movie;
  watchHistory: WatchHistory[];
};

export function serializeLibraryMovie(item: LibraryMovie) {
  const latestWatch = item.watchHistory[0] ?? null;

  return {
    id: item.id,
    favorite: item.favorite,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    movie: {
      ...item.movie,
      genres: parseStringArray(item.movie.genresJson),
      cast: parseStringArray(item.movie.castJson),
      releaseDate: item.movie.releaseDate?.toISOString() ?? null,
      createdAt: item.movie.createdAt.toISOString(),
      updatedAt: item.movie.updatedAt.toISOString(),
    },
    latestWatch: latestWatch
      ? {
          ...latestWatch,
          watchedAt: latestWatch.watchedAt.toISOString(),
          createdAt: latestWatch.createdAt.toISOString(),
          updatedAt: latestWatch.updatedAt.toISOString(),
        }
      : null,
    watchHistory: item.watchHistory.map((watch) => ({
      ...watch,
      watchedAt: watch.watchedAt.toISOString(),
      createdAt: watch.createdAt.toISOString(),
      updatedAt: watch.updatedAt.toISOString(),
    })),
  };
}

export function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
