"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  Clock3,
  Film,
  Heart,
  ImagePlus,
  Library,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { LibraryItem, TmdbSearchResult } from "@/components/types";
import {
  Drawer,
  Field,
  IconButton,
  formatDate,
  inputClass,
  minutesToRuntime,
  textareaClass,
  tmdbImage,
  yearFromDate,
} from "@/components/ui";

type View = "shelf" | "recent" | "favorites" | "top";
type Sort = "recent" | "rating" | "release" | "title";
type FilterOptions = { genres: string[]; directors: string[] };
type LibraryResponse = {
  items?: LibraryItem[];
  filterOptions?: FilterOptions;
  message?: string;
};

const navItems: Array<{ id: View; label: string; icon: typeof Library }> = [
  { id: "shelf", label: "Mi estantería", icon: Library },
  { id: "recent", label: "Vistas recientemente", icon: Clock3 },
  { id: "favorites", label: "Favoritas", icon: Heart },
  { id: "top", label: "Mejor valoradas", icon: Star },
];

const viewTitles: Record<View, string> = {
  shelf: "Mi estantería",
  recent: "Vistas recientemente",
  favorites: "Favoritas",
  top: "Mejor valoradas",
};

const physicalFormats = ["Sin formato", "DVD", "Blu-ray", "VHS"];

export function MovieLibrary() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [view, setView] = useState<View>("shelf");
  const [sort, setSort] = useState<Sort>("recent");
  const [genre, setGenre] = useState("");
  const [director, setDirector] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ genres: [], directors: [] });
  const [search, setSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<LibraryItem | null>(null);

  const loadLibrary = async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      view,
      sort: view === "top" ? "rating" : sort,
    });

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (genre) {
      params.set("genre", genre);
    }

    if (director) {
      params.set("director", director);
    }

    try {
      const response = await fetch(`/api/library?${params.toString()}`, { signal });
      const data = (await response.json()) as LibraryResponse;

      if (!response.ok) {
        throw new Error(data.message);
      }

      setItems(data.items ?? []);
      setFilterOptions(data.filterOptions ?? { genres: [], directors: [] });
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      setError("No hemos podido cargar tu estantería.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => loadLibrary(controller.signal), 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [view, sort, genre, director, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowWelcome(false), 2500);
    return () => window.clearTimeout(timeout);
  }, []);

  const favoriteCount = useMemo(() => items.filter((item) => item.favorite).length, [items]);
  const averageRating = useMemo(() => {
    const ratings = items
      .map((item) => item.latestWatch?.rating)
      .filter((rating): rating is number => typeof rating === "number");

    if (ratings.length === 0) {
      return null;
    }

    return ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  }, [items]);

  const groupedItems = useMemo(() => {
    if (view !== "shelf" && view !== "recent") {
      return [{ year: viewTitles[view], items }];
    }

    const groups = new Map<string, LibraryItem[]>();

    for (const item of items) {
      const year = item.latestWatch ? yearFromDate(item.latestWatch.watchedAt) : "Sin fecha";
      groups.set(year, [...(groups.get(year) ?? []), item]);
    }

    return Array.from(groups.entries()).map(([year, groupItems]) => ({
      year,
      items: groupItems,
    }));
  }, [items, view]);

  const handleViewChange = (nextView: View) => {
    setView(nextView);
    if (nextView === "recent") {
      setSort("recent");
    }
    if (nextView === "top") {
      setSort("rating");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <WelcomeOverlay visible={showWelcome} />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(236,181,83,0.10),transparent_32rem),radial-gradient(circle_at_15%_22%,rgba(255,255,255,0.045),transparent_22rem)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:100%_72px] opacity-35" />
      </div>

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-white/10 bg-black/[0.20] px-3 py-3 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/[0.08] lg:px-4 lg:py-5">
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.035] px-2.5 py-2.5 shadow-[0_16px_60px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-zinc-950 shadow-[0_14px_40px_rgba(245,183,77,0.18)]">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-50">Filmoteca</p>
                  <p className="text-xs text-zinc-500">Colección personal</p>
                </div>
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleViewChange(item.id)}
                    className={`flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm transition ${
                      active
                        ? "bg-white/[0.085] text-white shadow-[inset_3px_0_0_rgba(245,183,77,0.82)]"
                        : "text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden pt-4 lg:block">
              <p className="px-3 text-[11px] font-medium uppercase text-zinc-600">
                Colecciones
              </p>
              <button
                type="button"
                className="mt-2 flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Nueva colección
              </button>
            </div>

            <button
              type="button"
              className="mt-auto hidden h-10 items-center gap-3 rounded-md px-3 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200 lg:flex"
            >
              <Settings className="h-4 w-4" />
              Ajustes
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0d0e10]/[0.86] px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-zinc-50">
                  {viewTitles[view]}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded border border-white/[0.07] bg-white/[0.035] px-2 py-1">
                    {items.length} películas
                  </span>
                  <span className="rounded border border-white/[0.07] bg-white/[0.035] px-2 py-1">
                    {favoriteCount} favoritas
                  </span>
                  <span className="rounded border border-white/[0.07] bg-white/[0.035] px-2 py-1">
                    {averageRating ? `Media ${averageRating.toFixed(1)}` : "Sin media"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar en mi colección"
                    className={`${inputClass} w-full pl-9`}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as Sort)}
                      className={`${inputClass} w-44 appearance-none pl-9`}
                      aria-label="Ordenar películas"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="rating">Mejor valoradas</option>
                      <option value="release">Año de estreno</option>
                      <option value="title">Título</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Film className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    <select
                      value={genre}
                      onChange={(event) => setGenre(event.target.value)}
                      className={`${inputClass} w-44 appearance-none pl-9`}
                      aria-label="Filtrar por género"
                    >
                      <option value="">Todos los géneros</option>
                      {filterOptions.genres.map((itemGenre) => (
                        <option key={itemGenre} value={itemGenre}>
                          {itemGenre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    <select
                      value={director}
                      onChange={(event) => setDirector(event.target.value)}
                      className={`${inputClass} w-48 appearance-none pl-9`}
                      aria-label="Filtrar por director"
                    >
                      <option value="">Todos los directores</option>
                      {filterOptions.directors.map((itemDirector) => (
                        <option key={itemDirector} value={itemDirector}>
                          {itemDirector}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-medium text-zinc-950 shadow-[0_14px_38px_rgba(245,183,77,0.14)] transition hover:bg-amber-300"
                >
                  <Plus className="h-4 w-4" />
                  Añadir película
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {loading ? <ShelfSkeleton /> : null}

            {!loading && error ? (
              <StateMessage
                title="No se ha podido cargar la estantería"
                body="Revisa la conexión con la base de datos y vuelve a intentarlo."
                actionLabel="Reintentar"
                onAction={() => loadLibrary()}
              />
            ) : null}

            {!loading && !error && items.length === 0 && !search && !genre && !director ? (
              <StateMessage
                title="Tu estantería está vacía"
                body="Añade la primera película vista y empieza a construir tu colección."
                actionLabel="Añadir mi primera película"
                onAction={() => setAddOpen(true)}
              />
            ) : null}

            {!loading && !error && items.length === 0 && (search || genre || director) ? (
              <StateMessage
                title="Sin resultados"
                body="No hay películas que coincidan con esta búsqueda o filtro."
                actionLabel="Limpiar filtros"
                onAction={() => {
                  setSearch("");
                  setGenre("");
                  setDirector("");
                }}
              />
            ) : null}

            {!loading && !error && items.length > 0 ? (
              <div className="grid gap-12">
                {groupedItems.map((group) => (
                  <section key={group.year} className="grid gap-5">
                    <div className="flex items-end gap-4">
                      <h2 className="text-sm font-medium uppercase text-zinc-400">
                        {group.year}
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-amber-300/30 via-white/10 to-transparent shadow-shelf" />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-x-0 bottom-[4.55rem] hidden h-3 rounded-sm bg-gradient-to-b from-white/[0.08] to-black/[0.20] shadow-[0_18px_34px_rgba(0,0,0,0.28)] sm:block" />
                      <div className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
                      {group.items.map((item) => (
                        <MoviePoster key={item.id} item={item} onOpen={() => setSelected(item)} />
                      ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <AddMovieDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => loadLibrary()}
      />
      <MovieDetailDrawer
        item={selected}
        onClose={() => setSelected(null)}
        onUpdated={(updated) => {
          setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          setSelected(updated);
        }}
        onDeleted={(deletedId) => {
          setItems((current) => current.filter((item) => item.id !== deletedId));
          setSelected(null);
        }}
      />
    </main>
  );
}

function WelcomeOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#08090a] px-6 transition duration-700 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(245,183,77,0.10),transparent_34rem)]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <div className="absolute inset-x-0 top-[calc(50%+76px)] h-px bg-amber-300/[0.18] shadow-[0_18px_52px_rgba(0,0,0,0.55)]" />
      <div className="absolute bottom-12 left-1/2 grid w-[min(760px,88vw)] -translate-x-1/2 grid-cols-8 gap-2 opacity-20 sm:bottom-16">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[2/3] rounded-sm bg-white/[0.08] ring-1 ring-white/10"
          />
        ))}
      </div>

      <div className="relative max-w-xl text-center welcome-intro">
        <div className="mx-auto mb-7 flex h-11 w-11 items-center justify-center rounded-md bg-amber-400 text-sm font-semibold text-zinc-950 shadow-[0_18px_60px_rgba(245,183,77,0.16)]">
          F
        </div>
        <p className="text-4xl font-semibold text-zinc-50 sm:text-6xl">¡Hola igor!</p>
        <p className="mt-4 text-base leading-7 text-zinc-400 sm:text-lg">
          Aquí tienes tu filmoteca
        </p>
        <div className="mx-auto mt-7 h-px w-36 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
      </div>
    </div>
  );
}

function MoviePoster({ item, onOpen }: { item: LibraryItem; onOpen: () => void }) {
  const poster = tmdbImage(item.movie.posterPath, "w500");
  const hasFormat = item.physicalFormat && item.physicalFormat !== "Sin formato";

  return (
    <button type="button" onClick={onOpen} className="group min-w-0 text-left">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-[#161719] shadow-poster ring-1 ring-white/[0.09] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.018] group-hover:ring-amber-300/40">
        {poster ? (
          <img
            src={poster}
            alt={`Póster de ${item.movie.title}`}
            className="h-full w-full object-cover poster-mask transition duration-500 group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#151618] text-zinc-700">
            <Film className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.76] via-black/[0.12] to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        {hasFormat ? (
          <span className="absolute left-2 top-2 rounded bg-black/[0.62] px-2 py-1 text-[11px] font-medium text-amber-100 ring-1 ring-white/10 backdrop-blur">
            {item.physicalFormat}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 translate-y-3 px-3 pb-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between text-xs text-white">
            <span>{item.latestWatch ? formatDate(item.latestWatch.watchedAt) : "Sin visionado"}</span>
            <span className="inline-flex items-center gap-1 rounded bg-black/[0.58] px-1.5 py-0.5">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              {item.latestWatch?.rating ?? "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-medium text-zinc-100">{item.movie.title}</h3>
          {item.favorite ? <Heart className="mt-0.5 h-3.5 w-3.5 fill-rose-400 text-rose-400" /> : null}
        </div>
        <p className="text-xs text-zinc-500 transition group-hover:text-zinc-400">
          {yearFromDate(item.movie.releaseDate)}
          {item.latestWatch ? ` · ★ ${item.latestWatch.rating}` : ""}
        </p>
      </div>
    </button>
  );
}

function ShelfSkeleton() {
  return (
    <div className="grid gap-10">
      {[2026, 2025].map((year) => (
        <section key={year} className="grid gap-4">
          <div className="flex items-end gap-4">
            <div className="h-4 w-16 rounded bg-white/[0.08]" />
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="min-w-0">
                <div className="aspect-[2/3] animate-pulse rounded-md bg-white/[0.06]" />
                <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function StateMessage({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[52vh] max-w-md flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.035] text-amber-300 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-amber-400 px-4 text-sm font-medium text-zinc-950 shadow-[0_14px_38px_rgba(245,183,77,0.14)] transition hover:bg-amber-300"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function AddMovieDrawer({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [selected, setSelected] = useState<TmdbSearchResult | null>(null);
  const [watchedAt, setWatchedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState("8");
  const [review, setReview] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [physicalFormat, setPhysicalFormat] = useState("Sin formato");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [setupMessage, setSetupMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      setSetupMessage("");

      try {
        const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          results?: TmdbSearchResult[];
          message?: string;
          setupRequired?: boolean;
        };

        if (!response.ok) {
          throw new Error(data.message);
        }

        if (data.setupRequired && data.message) {
          setSetupMessage(data.message);
        }

        setResults(data.results ?? []);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error && requestError.message
            ? requestError.message
            : "No hemos podido buscar películas en TMDB.",
        );
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, open]);

  const reset = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    setWatchedAt(new Date().toISOString().slice(0, 10));
    setRating("8");
    setReview("");
    setFavorite(false);
    setPhysicalFormat("Sin formato");
    setError("");
    setSetupMessage("");
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: selected.id,
          watchedAt,
          rating: Number(rating),
          review,
          favorite,
          physicalFormat,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message);
      }

      reset();
      onSaved();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "No hemos podido guardar la película.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} title="Añadir película" onClose={onClose}>
      <div className="grid gap-6 px-5 py-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
            placeholder="Buscar película..."
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        {error ? <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        {setupMessage ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
            {setupMessage} Mientras tanto puedes probar con estos resultados demo.
          </p>
        ) : null}

        {!selected ? (
          <div className="grid gap-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 rounded-md p-2">
                  <div className="h-24 w-16 animate-pulse rounded bg-white/[0.06]" />
                  <div className="flex flex-1 flex-col gap-3 py-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.04]" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))
            ) : results.length > 0 ? (
              results.map((movie) => (
                <button
                  type="button"
                  key={movie.id}
                  onClick={() => setSelected(movie)}
                  className="flex gap-3 rounded-md border border-transparent p-2 text-left transition hover:border-white/[0.08] hover:bg-white/[0.045]"
                >
                  <PosterThumb path={movie.poster_path} title={movie.title} />
                  <div className="min-w-0 py-1">
                    <h3 className="truncate text-sm font-medium text-zinc-100">{movie.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{yearFromDate(movie.release_date)}</p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {movie.director ?? (movie.original_title !== movie.title ? movie.original_title : "Director no disponible")}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">{movie.overview}</p>
                  </div>
                </button>
              ))
            ) : query.trim().length >= 2 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No hay resultados para esta búsqueda.</p>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">
                Busca por título para traer la información desde TMDB.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="grid gap-5">
            <div className="flex gap-4">
              <PosterThumb path={selected.poster_path} title={selected.title} large />
              <div className="min-w-0 py-1">
                <h3 className="text-base font-medium text-zinc-100">{selected.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{yearFromDate(selected.release_date)}</p>
                {selected.original_title !== selected.title ? (
                  <p className="mt-1 text-sm text-zinc-500">{selected.original_title}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-4 text-sm text-amber-300 hover:text-amber-200"
                >
                  Cambiar selección
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Fecha vista">
                <input
                  type="date"
                  value={watchedAt}
                  onChange={(event) => setWatchedAt(event.target.value)}
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Puntuación">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className={inputClass}
                  required
                />
              </Field>
            </div>

            <Field label="Comentario">
              <textarea
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="Una nota personal sobre este visionado"
                className={textareaClass}
              />
            </Field>

            <Field label="Formato">
              <select
                value={physicalFormat}
                onChange={(event) => setPhysicalFormat(event.target.value)}
                className={`${inputClass} w-full appearance-none`}
              >
                {physicalFormats.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-sm text-zinc-300">
              <span>Marcar como favorita</span>
              <input
                type="checkbox"
                checked={favorite}
                onChange={(event) => setFavorite(event.target.checked)}
                className="h-4 w-4 accent-amber-400"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-medium text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar película"}
            </button>
          </form>
        )}
      </div>
    </Drawer>
  );
}

function MovieDetailDrawer({
  item,
  onClose,
  onUpdated,
  onDeleted,
}: {
  item: LibraryItem | null;
  onClose: () => void;
  onUpdated: (item: LibraryItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [watchedAt, setWatchedAt] = useState("");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  const [physicalFormat, setPhysicalFormat] = useState("Sin formato");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setWatchedAt(item?.latestWatch?.watchedAt.slice(0, 10) ?? "");
    setRating(item?.latestWatch ? String(item.latestWatch.rating) : "");
    setReview(item?.latestWatch?.review ?? "");
    setPhysicalFormat(item?.physicalFormat ?? "Sin formato");
    setPhotos(item?.photos ?? []);
    setError("");
  }, [item]);

  if (!item) {
    return null;
  }

  const poster = tmdbImage(item.movie.posterPath, "w500");
  const backdrop = tmdbImage(item.movie.backdropPath, "w1280");

  const patchItem = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/library/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { item?: LibraryItem; message?: string };

      if (!response.ok || !data.item) {
        throw new Error(data.message);
      }

      onUpdated(data.item);
    } catch {
      setError("No hemos podido actualizar la película.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("¿Eliminar esta película de tu estantería?");
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/library/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error();
      }
      onDeleted(item.id);
    } catch {
      setError("No hemos podido eliminar la película.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    patchItem({
      watchedAt,
      rating: Number(rating),
      review,
      physicalFormat,
      photos,
    });
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setError("");

    try {
      const remainingSlots = Math.max(0, 6 - photos.length);
      const selectedFiles = Array.from(files).slice(0, remainingSlots);
      const resizedPhotos = await Promise.all(selectedFiles.map((file) => resizeImageFile(file)));
      setPhotos((current) => [...current, ...resizedPhotos].slice(0, 6));
    } catch {
      setError("No hemos podido preparar esas fotografías.");
    }
  };

  const removePhoto = (photoIndex: number) => {
    setPhotos((current) => current.filter((_, index) => index !== photoIndex));
  };

  return (
    <Drawer open={Boolean(item)} title={item.movie.title} onClose={onClose} wide>
      <div>
        <div className="relative min-h-80 overflow-hidden border-b border-white/10">
          {backdrop ? (
            <img
              src={backdrop}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-[0.42]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101113] via-[#101113]/70 to-[#101113]/25" />
          <div className="relative grid gap-6 px-5 pb-7 pt-28 sm:grid-cols-[170px_1fr] sm:px-8">
            <div className="aspect-[2/3] w-40 overflow-hidden rounded-md bg-zinc-900 shadow-poster ring-1 ring-white/10 sm:w-full">
              {poster ? (
                <img src={poster} alt={`Póster de ${item.movie.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-700">
                  <Film className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="self-end">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {item.movie.genres.slice(0, 4).map((genreItem) => (
                  <span
                    key={genreItem}
                    className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-200 backdrop-blur"
                  >
                    {genreItem}
                  </span>
                ))}
              </div>
              <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
                {item.movie.title}
              </h2>
              {item.movie.originalTitle !== item.movie.title ? (
                <p className="mt-2 text-sm text-zinc-300">{item.movie.originalTitle}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-300">
                <span>{yearFromDate(item.movie.releaseDate)}</span>
                <span>{minutesToRuntime(item.movie.runtime)}</span>
                {item.movie.director ? <span>{item.movie.director}</span> : null}
                {item.movie.tmdbVoteAverage ? <span>TMDB {item.movie.tmdbVoteAverage.toFixed(1)}</span> : null}
                {item.physicalFormat !== "Sin formato" ? <span>{item.physicalFormat}</span> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[1fr_320px]">
          <section className="grid content-start gap-7">
            <div>
              <h3 className="text-xs font-medium uppercase text-zinc-500">Sinopsis</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
                {item.movie.overview || "No hay sinopsis disponible para esta película."}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase text-zinc-500">Reparto principal</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {item.movie.cast.length > 0 ? item.movie.cast.join(", ") : "Reparto no disponible."}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase text-zinc-500">Historial</h3>
              <div className="mt-3 grid gap-2">
                {item.watchHistory.map((watch) => (
                  <div
                    key={watch.id}
                    className="flex items-center justify-between border-b border-white/[0.08] py-2 text-sm"
                  >
                    <span className="text-zinc-300">{formatDate(watch.watchedAt)}</span>
                    <span className="text-amber-300">★ {watch.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase text-zinc-500">Mi información</h3>
              <div className="flex gap-2">
                <IconButton
                  label={item.favorite ? "Quitar favorita" : "Marcar favorita"}
                  onClick={() => patchItem({ favorite: !item.favorite })}
                  className={item.favorite ? "text-rose-300" : ""}
                >
                  <Heart className={`h-4 w-4 ${item.favorite ? "fill-rose-400 text-rose-400" : ""}`} />
                </IconButton>
                <IconButton label="Eliminar" onClick={handleDelete} className="hover:text-red-200">
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            {error ? <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field label="Formato">
                <select
                  value={physicalFormat}
                  onChange={(event) => setPhysicalFormat(event.target.value)}
                  className={`${inputClass} w-full appearance-none`}
                >
                  {physicalFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fecha vista">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="date"
                    value={watchedAt}
                    onChange={(event) => setWatchedAt(event.target.value)}
                    className={`${inputClass} w-full pl-9`}
                    required
                  />
                </div>
              </Field>

              <Field label="Puntuación">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className={`${inputClass} w-full`}
                  required
                />
              </Field>

              <Field label="Comentario">
                <textarea
                  value={review}
                  onChange={(event) => setReview(event.target.value)}
                  className={textareaClass}
                  placeholder="Tu comentario personal"
                />
              </Field>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs font-medium uppercase text-zinc-500">Fotografías</h4>
                  <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08]">
                    <ImagePlus className="h-4 w-4" />
                    Añadir
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(event) => {
                        handlePhotoUpload(event.target.files);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                {photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo.slice(0, 28)}-${index}`}
                        className="group/photo relative aspect-square overflow-hidden rounded-md bg-zinc-900 ring-1 ring-white/10"
                      >
                        <img
                          src={photo}
                          alt={`Fotografía personal ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-black/[0.62] text-zinc-200 opacity-0 transition hover:text-red-200 group-hover/photo:opacity-100"
                          aria-label="Eliminar fotografía"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-white/[0.08] px-3 py-4 text-center text-sm text-zinc-600">
                    Añade fotos de tu edición, carátula o copia física.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center justify-center rounded-md bg-white text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </aside>
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-[#101113]/[0.96] px-5 py-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-medium text-zinc-950 shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition hover:bg-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la estantería
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function PosterThumb({
  path,
  title,
  large = false,
}: {
  path: string | null;
  title: string;
  large?: boolean;
}) {
  const src = tmdbImage(path, "w185");

  return (
    <div
      className={`shrink-0 overflow-hidden rounded bg-zinc-900 ring-1 ring-white/10 ${
        large ? "h-36 w-24" : "h-24 w-16"
      }`}
    >
      {src ? (
        <img src={src} alt={`Póster de ${title}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-zinc-700">
          <Film className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}

async function resizeImageFile(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1000;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas unavailable");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.78);
}
