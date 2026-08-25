export type Movie = {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  runtime: number | null;
  director: string | null;
  genres: string[];
  cast: string[];
  overview: string | null;
  tmdbVoteAverage: number | null;
  createdAt: string;
  updatedAt: string;
};

export type WatchHistory = {
  id: string;
  userMovieId: string;
  watchedAt: string;
  rating: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LibraryItem = {
  id: string;
  favorite: boolean;
  physicalFormat: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
  movie: Movie;
  latestWatch: WatchHistory | null;
  watchHistory: WatchHistory[];
};

export type TmdbSearchResult = {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  director?: string | null;
};
