import { NextResponse } from "next/server";
import {
  extractDirector,
  getMovieDetails,
  isTmdbConfigured,
  searchFallbackMovies,
  searchMovies,
} from "@/lib/tmdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    if (!isTmdbConfigured()) {
      return NextResponse.json({
        results: searchFallbackMovies(query).map((movie) => ({
          ...movie,
          director: extractDirector(movie),
        })),
        setupRequired: true,
        message: "Añade TMDB_API_KEY para buscar en el catálogo completo.",
      });
    }

    const movies = await searchMovies(query);
    const results = await Promise.all(
      movies.slice(0, 6).map(async (movie) => {
        try {
          const details = await getMovieDetails(movie.id);
          return { ...movie, director: extractDirector(details) };
        } catch {
          return { ...movie, director: null };
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "TMDB_API_KEY_MISSING"
        ? "Configura TMDB_API_KEY para buscar películas."
        : "No hemos podido buscar en TMDB ahora mismo.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
