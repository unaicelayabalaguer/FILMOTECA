import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Film } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0d0e] px-5 py-6 sm:px-8 sm:py-8">
      <Image
        src="/images/cinema-projector.jpg"
        alt="Bobina de un proyector de cine frente a unas cortinas rojas"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between border-b border-white/[0.09] pb-5">
          <div>
            <p className="font-display text-2xl text-zinc-100 sm:text-3xl">Colección de Igor</p>
            <p className="mt-1 text-xs text-zinc-400">Archivo personal</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden="true" />
        </header>

        <section className="flex flex-1 items-end py-10 sm:py-14">
          <div className="w-full max-w-3xl">
            <div className="mb-9 max-w-xl">
              <h1 className="font-display text-4xl leading-tight text-zinc-50 sm:text-5xl">
                ¿Qué quieres consultar?
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Películas y publicaciones guardadas en tu colección.
              </p>
            </div>

            <div className="divide-y divide-white/15 border-y border-white/15 bg-black/20 backdrop-blur-sm">
              <CollectionLink
                href="/filmoteca"
                title="Filmoteca"
                description="Películas, formatos, valoraciones y visionados"
                label="Ver películas"
                icon={<Film className="h-6 w-6" />}
              />
              <CollectionLink
                href="/revisteca"
                title="Revisteca"
                description="Revistas, libros, catálogos y otras publicaciones"
                label="Ver publicaciones"
                icon={<BookOpen className="h-6 w-6" />}
              />
            </div>
            <p className="mt-4 text-[10px] text-white/35">Foto: Mariia Stepanova · Unsplash</p>
          </div>
        </section>

        <footer className="border-t border-white/[0.09] pt-4 text-xs text-zinc-700">
          Filmoteca · Revisteca
        </footer>
      </div>
    </main>
  );
}

function CollectionLink({
  href,
  title,
  description,
  label,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group grid gap-6 px-4 py-6 transition-colors hover:bg-white/[0.06] sm:grid-cols-[64px_1fr_auto] sm:items-center sm:px-5 sm:py-7"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/15 bg-black/20 text-zinc-300 transition-colors group-hover:border-amber-300/40 group-hover:text-amber-200">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-3xl text-zinc-100 sm:text-4xl">{title}</h2>
        <p className="mt-1.5 text-sm text-zinc-400 transition-colors group-hover:text-zinc-300">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-xs text-zinc-400 sm:hidden">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-amber-200" title={label}>
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
