import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import {
  extractCast,
  extractDirector,
  getFallbackMovieDetails,
  getMovieDetails,
  isTmdbConfigured,
} from "@/lib/tmdb";
import { parseStringArray, serializeLibraryMovie } from "@/lib/serializers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const view = searchParams.get("view") ?? "shelf";
  const sort = searchParams.get("sort") ?? "recent";
  const genre = searchParams.get("genre")?.trim();
  const director = searchParams.get("director")?.trim();

  try {
    const user = await getCurrentUser();
    const movieWhere: Prisma.MovieWhereInput = {};

    if (search) {
      movieWhere.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { originalTitle: { contains: search, mode: "insensitive" } },
      ];
    }

    if (director) {
      movieWhere.director = { contains: director, mode: "insensitive" };
    }

    const where: Prisma.UserMovieWhereInput = {
      userId: user.id,
      ...(view === "favorites" ? { favorite: true } : {}),
      ...(Object.keys(movieWhere).length > 0 ? { movie: movieWhere } : {}),
    };

    const [items, allItems] = await Promise.all([
      prisma.userMovie.findMany({
        where,
        include: {
          movie: true,
          watchHistory: {
            orderBy: { watchedAt: "desc" },
          },
        },
      }),
      prisma.userMovie.findMany({
        where: { userId: user.id },
        include: {
          movie: true,
          watchHistory: {
            orderBy: { watchedAt: "desc" },
          },
        },
      }),
    ]);

    const filterOptions = {
      genres: Array.from(
        new Set(allItems.flatMap((item) => parseStringArray(item.movie.genresJson))),
      ).sort((a, b) => a.localeCompare(b)),
      directors: Array.from(
        new Set(
          allItems
            .map((item) => item.movie.director)
            .filter((itemDirector): itemDirector is string => Boolean(itemDirector)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    };

    const filtered = genre
      ? items.filter((item) => parseStringArray(item.movie.genresJson).includes(genre))
      : items;

    const sorted = filtered.sort((a, b) => {
      const aWatch = a.watchHistory[0];
      const bWatch = b.watchHistory[0];

      if (sort === "rating") {
        return (bWatch?.rating ?? 0) - (aWatch?.rating ?? 0);
      }

      if (sort === "release") {
        return (b.movie.releaseDate?.getTime() ?? 0) - (a.movie.releaseDate?.getTime() ?? 0);
      }

      if (sort === "title") {
        return a.movie.title.localeCompare(b.movie.title);
      }

      return (bWatch?.watchedAt.getTime() ?? 0) - (aWatch?.watchedAt.getTime() ?? 0);
    });

    return NextResponse.json({ items: sorted.map(serializeLibraryMovie), filterOptions });
  } catch {
    return NextResponse.json(
      { message: "No hemos podido cargar tu estantería." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tmdbId?: number;
      watchedAt?: string;
      rating?: number;
      review?: string;
      favorite?: boolean;
      physicalFormat?: string;
    };

    if (!body.tmdbId || !body.watchedAt || typeof body.rating !== "number") {
      return NextResponse.json({ message: "Faltan datos para guardar la película." }, { status: 400 });
    }

    if (body.rating < 1 || body.rating > 10) {
      return NextResponse.json({ message: "La puntuación debe estar entre 1 y 10." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const details = isTmdbConfigured()
      ? await getMovieDetails(body.tmdbId)
      : getFallbackMovieDetails(body.tmdbId);

    if (!details) {
      return NextResponse.json(
        { message: "Añade TMDB_API_KEY para guardar películas del catálogo completo." },
        { status: 400 },
      );
    }

    const director = extractDirector(details);
    const cast = extractCast(details);
    const genres = details.genres.map((genre) => genre.name);

    const movie = await prisma.movie.upsert({
      where: { tmdbId: details.id },
      update: {
        title: details.title,
        originalTitle: details.original_title,
        posterPath: details.poster_path,
        backdropPath: details.backdrop_path,
        releaseDate: details.release_date ? new Date(details.release_date) : null,
        runtime: details.runtime,
        director,
        genresJson: JSON.stringify(genres),
        castJson: JSON.stringify(cast),
        overview: details.overview,
        tmdbVoteAverage: details.vote_average,
      },
      create: {
        tmdbId: details.id,
        title: details.title,
        originalTitle: details.original_title,
        posterPath: details.poster_path,
        backdropPath: details.backdrop_path,
        releaseDate: details.release_date ? new Date(details.release_date) : null,
        runtime: details.runtime,
        director,
        genresJson: JSON.stringify(genres),
        castJson: JSON.stringify(cast),
        overview: details.overview,
        tmdbVoteAverage: details.vote_average,
      },
    });

    const userMovie = await prisma.userMovie.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: movie.id,
        },
      },
      update: {
        favorite: body.favorite ?? false,
        physicalFormat: normalizePhysicalFormat(body.physicalFormat),
      },
      create: {
        userId: user.id,
        movieId: movie.id,
        favorite: body.favorite ?? false,
        physicalFormat: normalizePhysicalFormat(body.physicalFormat),
      },
    });

    await prisma.watchHistory.create({
      data: {
        userMovieId: userMovie.id,
        watchedAt: new Date(body.watchedAt),
        rating: body.rating,
        review: body.review?.trim() || null,
      },
    });

    const saved = await prisma.userMovie.findUniqueOrThrow({
      where: { id: userMovie.id },
      include: {
        movie: true,
        watchHistory: { orderBy: { watchedAt: "desc" } },
      },
    });

    return NextResponse.json({ item: serializeLibraryMovie(saved) }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "TMDB_API_KEY_MISSING"
        ? "Configura TMDB_API_KEY para guardar películas desde TMDB."
        : "No hemos podido guardar la película.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

function normalizePhysicalFormat(value: string | undefined) {
  const allowed = ["Sin formato", "DVD", "Blu-ray", "VHS"];
  return value && allowed.includes(value) ? value : "Sin formato";
}
