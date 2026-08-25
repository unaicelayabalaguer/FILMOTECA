const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type TmdbSearchMovie = {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  popularity: number;
};

type TmdbCredits = {
  cast: Array<{ name: string; order: number }>;
  crew: Array<{ name: string; job: string }>;
};

export type TmdbMovieDetails = TmdbSearchMovie & {
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  credits: TmdbCredits;
};

function getApiKey() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY_MISSING");
  }

  return apiKey;
}

export function isTmdbConfigured() {
  return Boolean(process.env.TMDB_API_KEY?.trim());
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", params.language ?? "es-ES");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error("TMDB_REQUEST_FAILED");
  }

  return response.json() as Promise<T>;
}

export function tmdbImage(path: string | null | undefined, size = "w500") {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function searchMovies(query: string) {
  const searches = buildSearchQueries(query);
  const pages = await Promise.all(
    searches.map((searchQuery) =>
      Promise.all([
        tmdbFetch<{ results: TmdbSearchMovie[] }>("/search/movie", {
          query: searchQuery,
          include_adult: "false",
          language: "es-ES",
        }),
        tmdbFetch<{ results: TmdbSearchMovie[] }>("/search/movie", {
          query: searchQuery,
          include_adult: "false",
          language: "en-US",
        }),
      ]),
    ),
  );

  const unique = new Map<number, TmdbSearchMovie>();

  for (const pagePair of pages) {
    for (const page of pagePair) {
      for (const movie of page.results) {
        unique.set(movie.id, movie);
      }
    }
  }

  return Array.from(unique.values())
    .filter((movie) => movie.poster_path || movie.popularity > 8)
    .sort((a, b) => scoreSearchResult(b, query) - scoreSearchResult(a, query))
    .slice(0, 8);
}

export async function getMovieDetails(tmdbId: number) {
  return tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`, {
    append_to_response: "credits",
  });
}

export function searchFallbackMovies(query: string) {
  const normalizedQuery = normalizeText(query);

  return FALLBACK_MOVIES.filter((movie) => {
    const title = normalizeText(movie.title);
    const originalTitle = normalizeText(movie.original_title);
    return title.includes(normalizedQuery) || originalTitle.includes(normalizedQuery);
  })
    .sort((a, b) => scoreSearchResult(b, query) - scoreSearchResult(a, query))
    .slice(0, 8);
}

export function getFallbackMovieDetails(tmdbId: number) {
  return FALLBACK_MOVIES.find((movie) => movie.id === tmdbId) ?? null;
}

export function getMovieYear(releaseDate: string | Date | null | undefined) {
  if (!releaseDate) {
    return "Sin año";
  }

  const date = releaseDate instanceof Date ? releaseDate : new Date(releaseDate);
  const year = date.getFullYear();

  return Number.isNaN(year) ? "Sin año" : String(year);
}

export function extractDirector(details: TmdbMovieDetails) {
  return details.credits.crew.find((person) => person.job === "Director")?.name ?? null;
}

export function extractCast(details: TmdbMovieDetails) {
  return details.credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 6)
    .map((person) => person.name);
}

function buildSearchQueries(query: string) {
  const cleanQuery = query.trim();
  const normalized = normalizeText(cleanQuery);
  const aliases: Record<string, string[]> = {
    spi: ["spider-man", "spider man"],
    spid: ["spider-man", "spider man"],
    spide: ["spider-man", "spider man"],
    spider: ["spider-man", "spider man"],
    spiderman: [
      "spider-man",
      "spider man",
      "spider-man 2",
      "spider-man 3",
      "the amazing spider-man",
      "spider-verse",
    ],
    bat: ["batman"],
    hp: ["harry potter"],
    lotr: ["lord of the rings"],
    esdla: ["el señor de los anillos", "the lord of the rings"],
    starwar: ["star wars"],
    starwars: ["star wars"],
  };

  return Array.from(new Set([cleanQuery, ...(aliases[normalized] ?? [])]));
}

function scoreSearchResult(movie: TmdbSearchMovie, query: string) {
  const normalizedQuery = normalizeText(query);
  const title = normalizeText(movie.title);
  const originalTitle = normalizeText(movie.original_title);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
  let score = movie.popularity ?? 0;
  const franchiseBoost = getFranchiseBoost(movie.id, normalizedQuery);

  if (franchiseBoost > 0) {
    return 2000 + franchiseBoost;
  }

  if (title === normalizedQuery || originalTitle === normalizedQuery) {
    score += 400;
  }

  if (title.startsWith(normalizedQuery) || originalTitle.startsWith(normalizedQuery)) {
    score += 240;
  }

  if (title.includes(normalizedQuery) || originalTitle.includes(normalizedQuery)) {
    score += 120;
  }

  if (movie.poster_path) {
    score += 25;
  }

  if (releaseYear >= 1960) {
    score += 10;
  }

  return score + franchiseBoost;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function getFranchiseBoost(tmdbId: number, normalizedQuery: string) {
  if (!"spiderman".startsWith(normalizedQuery)) {
    return 0;
  }

  const boosts: Record<number, number> = {
    557: 900,
    558: 890,
    559: 880,
    1930: 830,
    102382: 820,
    315635: 810,
    429617: 790,
    324857: 760,
    569094: 750,
    634649: 730,
    969681: 700,
  };

  return boosts[tmdbId] ?? 0;
}

const FALLBACK_MOVIES: TmdbMovieDetails[] = [
  {
    id: 557,
    title: "Spider-Man",
    original_title: "Spider-Man",
    poster_path: null,
    backdrop_path: null,
    release_date: "2002-05-01",
    runtime: 121,
    genres: [{ id: 28, name: "Acción" }, { id: 12, name: "Aventura" }],
    overview: "Peter Parker descubre sus poderes y se convierte en Spider-Man.",
    vote_average: 7.3,
    popularity: 180,
    credits: {
      crew: [{ name: "Sam Raimi", job: "Director" }],
      cast: [
        { name: "Tobey Maguire", order: 0 },
        { name: "Willem Dafoe", order: 1 },
        { name: "Kirsten Dunst", order: 2 },
      ],
    },
  },
  {
    id: 558,
    title: "Spider-Man 2",
    original_title: "Spider-Man 2",
    poster_path: null,
    backdrop_path: null,
    release_date: "2004-06-25",
    runtime: 127,
    genres: [{ id: 28, name: "Acción" }, { id: 12, name: "Aventura" }],
    overview: "Peter Parker se enfrenta al Doctor Octopus mientras duda de su vida como héroe.",
    vote_average: 7.4,
    popularity: 170,
    credits: {
      crew: [{ name: "Sam Raimi", job: "Director" }],
      cast: [
        { name: "Tobey Maguire", order: 0 },
        { name: "Alfred Molina", order: 1 },
        { name: "Kirsten Dunst", order: 2 },
      ],
    },
  },
  {
    id: 559,
    title: "Spider-Man 3",
    original_title: "Spider-Man 3",
    poster_path: null,
    backdrop_path: null,
    release_date: "2007-05-01",
    runtime: 139,
    genres: [{ id: 28, name: "Acción" }, { id: 12, name: "Aventura" }],
    overview: "Spider-Man afronta nuevos enemigos y el lado oscuro de sus propios poderes.",
    vote_average: 6.4,
    popularity: 145,
    credits: {
      crew: [{ name: "Sam Raimi", job: "Director" }],
      cast: [
        { name: "Tobey Maguire", order: 0 },
        { name: "Kirsten Dunst", order: 1 },
        { name: "James Franco", order: 2 },
      ],
    },
  },
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    original_title: "Spider-Man: No Way Home",
    poster_path: null,
    backdrop_path: null,
    release_date: "2021-12-15",
    runtime: 148,
    genres: [{ id: 28, name: "Acción" }, { id: 12, name: "Aventura" }],
    overview: "Peter Parker pide ayuda al Doctor Strange y abre una grieta multiversal.",
    vote_average: 7.9,
    popularity: 210,
    credits: {
      crew: [{ name: "Jon Watts", job: "Director" }],
      cast: [
        { name: "Tom Holland", order: 0 },
        { name: "Zendaya", order: 1 },
        { name: "Benedict Cumberbatch", order: 2 },
      ],
    },
  },
  {
    id: 324857,
    title: "Spider-Man: Un nuevo universo",
    original_title: "Spider-Man: Into the Spider-Verse",
    poster_path: null,
    backdrop_path: null,
    release_date: "2018-12-06",
    runtime: 117,
    genres: [{ id: 16, name: "Animación" }, { id: 28, name: "Acción" }],
    overview: "Miles Morales descubre un multiverso lleno de versiones de Spider-Man.",
    vote_average: 8.4,
    popularity: 195,
    credits: {
      crew: [{ name: "Bob Persichetti", job: "Director" }],
      cast: [
        { name: "Shameik Moore", order: 0 },
        { name: "Jake Johnson", order: 1 },
        { name: "Hailee Steinfeld", order: 2 },
      ],
    },
  },
  {
    id: 157336,
    title: "Interstellar",
    original_title: "Interstellar",
    poster_path: null,
    backdrop_path: null,
    release_date: "2014-11-05",
    runtime: 169,
    genres: [{ id: 878, name: "Ciencia ficción" }, { id: 18, name: "Drama" }],
    overview: "Un grupo de exploradores viaja más allá de nuestra galaxia para buscar un futuro para la humanidad.",
    vote_average: 8.5,
    popularity: 230,
    credits: {
      crew: [{ name: "Christopher Nolan", job: "Director" }],
      cast: [
        { name: "Matthew McConaughey", order: 0 },
        { name: "Anne Hathaway", order: 1 },
        { name: "Jessica Chastain", order: 2 },
      ],
    },
  },
  {
    id: 155,
    title: "El caballero oscuro",
    original_title: "The Dark Knight",
    poster_path: null,
    backdrop_path: null,
    release_date: "2008-07-16",
    runtime: 152,
    genres: [{ id: 28, name: "Acción" }, { id: 80, name: "Crimen" }],
    overview: "Batman se enfrenta al Joker en una Gotham al borde del caos.",
    vote_average: 8.5,
    popularity: 220,
    credits: {
      crew: [{ name: "Christopher Nolan", job: "Director" }],
      cast: [
        { name: "Christian Bale", order: 0 },
        { name: "Heath Ledger", order: 1 },
        { name: "Aaron Eckhart", order: 2 },
      ],
    },
  },
  {
    id: 238,
    title: "El padrino",
    original_title: "The Godfather",
    poster_path: null,
    backdrop_path: null,
    release_date: "1972-03-14",
    runtime: 175,
    genres: [{ id: 80, name: "Crimen" }, { id: 18, name: "Drama" }],
    overview: "La familia Corleone vive el relevo de poder dentro de una dinastía criminal.",
    vote_average: 8.7,
    popularity: 205,
    credits: {
      crew: [{ name: "Francis Ford Coppola", job: "Director" }],
      cast: [
        { name: "Marlon Brando", order: 0 },
        { name: "Al Pacino", order: 1 },
        { name: "James Caan", order: 2 },
      ],
    },
  },
  {
    id: 603,
    title: "Matrix",
    original_title: "The Matrix",
    poster_path: null,
    backdrop_path: null,
    release_date: "1999-03-30",
    runtime: 136,
    genres: [{ id: 878, name: "Ciencia ficción" }, { id: 28, name: "Acción" }],
    overview: "Un hacker descubre que el mundo que conoce es una simulación.",
    vote_average: 8.2,
    popularity: 190,
    credits: {
      crew: [{ name: "Lana Wachowski", job: "Director" }],
      cast: [
        { name: "Keanu Reeves", order: 0 },
        { name: "Laurence Fishburne", order: 1 },
        { name: "Carrie-Anne Moss", order: 2 },
      ],
    },
  },
  {
    id: 438631,
    title: "Dune",
    original_title: "Dune",
    poster_path: null,
    backdrop_path: null,
    release_date: "2021-09-15",
    runtime: 155,
    genres: [{ id: 878, name: "Ciencia ficción" }, { id: 12, name: "Aventura" }],
    overview: "Paul Atreides llega a Arrakis, el planeta más peligroso del universo conocido.",
    vote_average: 7.8,
    popularity: 215,
    credits: {
      crew: [{ name: "Denis Villeneuve", job: "Director" }],
      cast: [
        { name: "Timothée Chalamet", order: 0 },
        { name: "Rebecca Ferguson", order: 1 },
        { name: "Oscar Isaac", order: 2 },
      ],
    },
  },
  {
    id: 693134,
    title: "Dune: Parte dos",
    original_title: "Dune: Part Two",
    poster_path: null,
    backdrop_path: null,
    release_date: "2024-02-27",
    runtime: 166,
    genres: [{ id: 878, name: "Ciencia ficción" }, { id: 12, name: "Aventura" }],
    overview: "Paul Atreides se une a los Fremen para vengar a su familia.",
    vote_average: 8.1,
    popularity: 225,
    credits: {
      crew: [{ name: "Denis Villeneuve", job: "Director" }],
      cast: [
        { name: "Timothée Chalamet", order: 0 },
        { name: "Zendaya", order: 1 },
        { name: "Rebecca Ferguson", order: 2 },
      ],
    },
  },
];
