import Link from "next/link";
import { BookOpen, Film, LibraryBig } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,183,77,0.11),transparent_34rem),linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:auto,100%_72px]" />
      <section className="relative w-full max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-amber-400 text-zinc-950 shadow-[0_18px_60px_rgba(245,183,77,0.16)]">
            <LibraryBig className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-zinc-50 sm:text-5xl">Mi colección</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">Elige la biblioteca que quieres consultar</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CollectionLink
            href="/filmoteca"
            title="Filmoteca"
            description="Películas, formatos físicos, valoraciones y visionados"
            countLabel="Abrir películas"
            icon={<Film className="h-8 w-8" />}
          />
          <CollectionLink
            href="/revisteca"
            title="Revisteca"
            description="Revistas, libros y catálogos con sus portadas y fotografías"
            countLabel="Abrir publicaciones"
            icon={<BookOpen className="h-8 w-8" />}
          />
        </div>
      </section>
    </main>
  );
}

function CollectionLink({
  href,
  title,
  description,
  countLabel,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  countLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-64 overflow-hidden rounded-md border border-white/10 bg-white/[0.035] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/35 hover:bg-white/[0.055] sm:p-9"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-black/25 text-amber-300 transition group-hover:border-amber-300/30 group-hover:bg-amber-400 group-hover:text-zinc-950">
        {icon}
      </div>
      <h2 className="mt-10 text-2xl font-semibold text-zinc-50">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
      <p className="mt-6 text-xs font-medium uppercase text-amber-300">{countLabel} →</p>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}
