import { X } from "lucide-react";
import type { ReactNode } from "react";

export function tmdbImage(path: string | null | undefined, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function yearFromDate(date: string | null | undefined) {
  if (!date) {
    return "Sin año";
  }

  const year = new Date(date).getFullYear();
  return Number.isNaN(year) ? "Sin año" : String(year);
}

export function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function minutesToRuntime(minutes: number | null) {
  if (!minutes) {
    return "Duración no disponible";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${hours}h ${rest}min`;
}

export function IconButton({
  label,
  children,
  onClick,
  className = "",
  type = "button",
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
  wide = false,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Cerrar panel"
        className="absolute inset-0 cursor-default bg-black/[0.62] backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        aria-label={title}
        className={`absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-white/10 bg-[#101113] shadow-[0_24px_90px_rgba(0,0,0,0.55)] scrollbar-subtle ${
          wide ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#101113]/[0.94] px-5 py-4 backdrop-blur">
          <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
          <IconButton label="Cerrar" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span className="text-xs uppercase text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-10 rounded-md border border-white/10 bg-black/[0.24] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10";

export const textareaClass =
  "min-h-28 rounded-md border border-white/10 bg-black/[0.24] px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-white/15 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/10";
