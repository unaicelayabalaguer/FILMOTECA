import Link from "next/link";
import { ArrowUpRight, BookOpen, Film, LibraryBig } from "lucide-react";

export default function Home() {
  return (
    <main className="collection-grid relative min-h-screen overflow-hidden bg-[#0b0c0d] px-5 py-6 sm:px-8 sm:py-8">
      <section className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-400 text-zinc-950 shadow-[0_14px_40px_rgba(245,183,77,0.13)]">
              <LibraryBig className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-100">Archivo personal</p>
              <p className="text-xs text-zinc-600">Colección de Igor</p>
            </div>
          </div>
          <p className="hidden text-xs text-zinc-600 sm:block">Películas · Revistas · Libros</p>
        </header>

        <div className="grid flex-1 items-end gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:py-14">
          <div className="self-center lg:self-end lg:pb-8">
            <p className="mb-4 text-xs font-medium uppercase text-amber-300">Biblioteca doméstica</p>
            <h1 className="font-display text-balance text-5xl leading-[0.98] text-zinc-50 sm:text-6xl lg:text-7xl">
              Todo lo que merece ser guardado.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
              Dos colecciones, un mismo archivo. Entra en la estantería que quieras consultar.
            </p>
          </div>

          <div className="grid gap-3">
            <CollectionLink href="/filmoteca" index="01" title="Filmoteca" description="Películas, formatos físicos, valoraciones y visionados" label="Abrir películas" icon={<Film className="h-6 w-6" />} />
            <CollectionLink href="/revisteca" index="02" title="Revisteca" description="Revistas, libros y catálogos con sus portadas y fotografías" label="Abrir publicaciones" icon={<BookOpen className="h-6 w-6" />} />
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-white/10 py-4 text-[11px] text-zinc-700">
          <span>Mi colección</span><span>Archivo digital</span>
        </footer>
      </section>
    </main>
  );
}

function CollectionLink({
  href,
  title,
  description,
  label,
  index,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  label: string;
  index: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative grid min-h-52 overflow-hidden rounded-md border border-white/10 bg-[#121315]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/35 hover:bg-[#161719] sm:grid-cols-[76px_1fr_auto] sm:items-center sm:gap-6 sm:p-7"
    >
      <div className="flex items-center gap-3 sm:grid sm:gap-4">
        <span className="text-xs text-zinc-700">{index}</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-black/25 text-amber-300 transition group-hover:border-amber-300/30 group-hover:bg-amber-400 group-hover:text-zinc-950">
          {icon}
        </div>
      </div>
      <div className="mt-7 sm:mt-0">
        <h2 className="font-display text-3xl text-zinc-50 sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      <div className="mt-7 flex items-center justify-between gap-4 sm:mt-0 sm:block">
        <span className="text-xs font-medium text-amber-300 sm:hidden">{label}</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-zinc-400 transition group-hover:border-amber-300/30 group-hover:text-amber-300" title={label}>
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
