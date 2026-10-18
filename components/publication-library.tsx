"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  Filter,
  House,
  ImagePlus,
  Languages,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Publication } from "@/components/types";
import { Drawer, Field, inputClass } from "@/components/ui";

type Filters = { genres: string[]; types: string[]; languages: string[]; authors: string[] };
type Sort = "recent" | "title" | "date" | "number";
type FormState = {
  title: string; issueNumber: string; publicationDate: string; author: string;
  genre: string; type: string; language: string; coverImage: string | null; photos: string[];
};

const emptyForm: FormState = {
  title: "", issueNumber: "", publicationDate: "", author: "", genre: "",
  type: "Revista", language: "Castellano", coverImage: null, photos: [],
};
const commonTypes = ["Revista", "Libro", "Catálogo"];
const commonGenres = ["Cine", "Deportes", "Informática", "Cultura", "Música", "Historia"];
const commonLanguages = ["Castellano", "Inglés", "Euskera", "Francés", "Alemán"];

export function PublicationLibrary() {
  const [items, setItems] = useState<Publication[]>([]);
  const [filters, setFilters] = useState<Filters>({ genres: [], types: [], languages: [], authors: [] });
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("");
  const [language, setLanguage] = useState("");
  const [author, setAuthor] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Publication | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ sort });
    if (search.trim()) params.set("search", search.trim());
    if (genre) params.set("genre", genre);
    if (type) params.set("type", type);
    if (language) params.set("language", language);
    if (author) params.set("author", author);
    try {
      const response = await fetch(`/api/publications?${params}`, { signal });
      const data = await response.json() as { items?: Publication[]; filterOptions?: Filters };
      if (!response.ok) throw new Error();
      setItems(data.items ?? []);
      setFilters(data.filterOptions ?? { genres: [], types: [], languages: [], authors: [] });
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("No hemos podido cargar la revisteca.");
    } finally {
      setLoading(false);
    }
  }, [author, genre, language, search, sort, type]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => load(controller.signal), 180);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [load]);

  const hasFilters = Boolean(search || genre || type || language || author);

  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-white/10 bg-black/20 px-3 py-3 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/[0.08] lg:px-4 lg:py-5">
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center gap-3 rounded-md border border-white/[0.06] bg-white/[0.035] px-2.5 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-zinc-950"><BookOpen className="h-5 w-5" /></div>
              <div><p className="text-sm font-semibold text-zinc-50">Revisteca</p><p className="text-xs text-zinc-500">Colección editorial</p></div>
            </div>
            <Link href="/" className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200">
              <House className="h-4 w-4" /> Volver al inicio
            </Link>
            <button type="button" onClick={() => setCreating(true)} className="flex h-10 items-center gap-3 rounded-md bg-white/[0.085] px-3 text-sm text-white shadow-[inset_3px_0_0_rgba(245,183,77,0.82)]">
              <BookOpen className="h-4 w-4" /> Mi colección
            </button>
            <div className="mt-auto hidden border-t border-white/[0.07] pt-4 text-xs leading-5 text-zinc-600 lg:block">
              Revistas, libros y catálogos<br />en una misma estantería.
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0d0e10]/[0.9] px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div><h1 className="text-xl font-semibold text-zinc-50">Mi revisteca</h1><p className="mt-1 text-xs text-zinc-500">{items.length} publicaciones</p></div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, número o autor" className={`${inputClass} w-full pl-9`} /></div>
                <Select value={sort} onChange={(value) => setSort(value as Sort)} icon={<Filter className="h-4 w-4" />} label="Ordenar" options={[['recent','Más recientes'],['title','Título'],['date','Fecha publicación'],['number','Número']]} />
                <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-medium text-zinc-950 hover:bg-amber-300"><Plus className="h-4 w-4" /> Añadir publicación</button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <Select value={type} onChange={setType} icon={<FileText className="h-4 w-4" />} label="Tipo" options={filters.types.map((value) => [value, value])} empty="Todos los tipos" />
              <Select value={genre} onChange={setGenre} icon={<BookOpen className="h-4 w-4" />} label="Género" options={filters.genres.map((value) => [value, value])} empty="Todos los géneros" />
              <Select value={language} onChange={setLanguage} icon={<Languages className="h-4 w-4" />} label="Idioma" options={filters.languages.map((value) => [value, value])} empty="Todos los idiomas" />
              <Select value={author} onChange={setAuthor} icon={<UserRound className="h-4 w-4" />} label="Autor" options={filters.authors.map((value) => [value, value])} empty="Todos los autores" />
              {hasFilters ? <button type="button" onClick={() => { setSearch(""); setGenre(""); setType(""); setLanguage(""); setAuthor(""); }} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-xs text-zinc-400 hover:bg-white/[0.05] hover:text-white"><X className="h-4 w-4" /> Limpiar</button> : null}
            </div>
          </header>

          <div className="px-4 py-7 sm:px-6 lg:px-8">
            {loading ? <Skeleton /> : null}
            {!loading && error ? <Empty title="No se ha podido cargar la revisteca" body="Revisa la conexión y vuelve a intentarlo." action="Reintentar" onAction={() => load()} /> : null}
            {!loading && !error && items.length === 0 ? <Empty title={hasFilters ? "Sin resultados" : "Tu revisteca está vacía"} body={hasFilters ? "No hay publicaciones que coincidan con los filtros." : "Añade tu primera revista, libro o catálogo."} action={hasFilters ? "Limpiar filtros" : "Añadir publicación"} onAction={() => hasFilters ? (setSearch(""), setGenre(""), setType(""), setLanguage(""), setAuthor("")) : setCreating(true)} /> : null}
            {!loading && !error && items.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
                {items.map((item) => <PublicationCard key={item.id} item={item} onClick={() => setSelected(item)} />)}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <PublicationForm open={creating} onClose={() => setCreating(false)} onSaved={(item) => { setCreating(false); setItems((current) => [item, ...current]); load(); }} />
      <PublicationForm item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} onSaved={(item) => { setSelected(item); setItems((current) => current.map((entry) => entry.id === item.id ? item : entry)); load(); }} onDeleted={(id) => { setSelected(null); setItems((current) => current.filter((entry) => entry.id !== id)); load(); }} />
    </main>
  );
}

function PublicationCard({ item, onClick }: { item: Publication; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group min-w-0 text-left">
    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#17181a] shadow-[0_20px_45px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-amber-300/40">
      {item.coverImage ? <img src={item.coverImage} alt={`Portada de ${item.title}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,#222326,#121315)] px-4 text-center text-zinc-600"><BookOpen className="h-10 w-10" /><span className="text-xs">Sin portada</span></div>}
      <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-amber-100 ring-1 ring-white/10 backdrop-blur">{item.type}</span>
      {item.issueNumber ? <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur">N.º {item.issueNumber}</span> : null}
    </div>
    <h2 className="mt-3 truncate text-sm font-medium text-zinc-100">{item.title}</h2>
    <p className="mt-1 truncate text-xs text-zinc-500">{item.author || item.genre || "Sin autor"}</p>
  </button>;
}

function PublicationForm({ open, item, onClose, onSaved, onDeleted }: { open: boolean; item?: Publication | null; onClose: () => void; onSaved: (item: Publication) => void; onDeleted?: (id: string) => void }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm(item ? { title: item.title, issueNumber: item.issueNumber ?? "", publicationDate: item.publicationDate?.slice(0, 10) ?? "", author: item.author ?? "", genre: item.genre ?? "", type: item.type, language: item.language ?? "", coverImage: item.coverImage, photos: item.photos } : emptyForm);
    setMessage("");
  }, [item, open]);

  const update = (key: keyof FormState, value: string | string[] | null) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch(item ? `/api/publications/${item.id}` : "/api/publications", { method: item ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { item?: Publication; message?: string };
      if (!response.ok || !data.item) throw new Error(data.message);
      onSaved(data.item);
    } catch (error) { setMessage(error instanceof Error && error.message ? error.message : "No hemos podido guardar la publicación."); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!item || !onDeleted || !window.confirm(`¿Eliminar “${item.title}” de la revisteca?`)) return;
    setSaving(true); setMessage("");
    try { const response = await fetch(`/api/publications/${item.id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); onDeleted(item.id); }
    catch { setMessage("No hemos podido eliminar la publicación."); setSaving(false); }
  };
  const upload = async (files: FileList | null, target: "coverImage" | "photos") => {
    if (!files?.length) return;
    setMessage("");
    try {
      if (target === "coverImage") update(target, await resizeImage(files[0], 1100, 0.78));
      else { const selected = Array.from(files).slice(0, 6 - form.photos.length); const images = await Promise.all(selected.map((file) => resizeImage(file, 1000, 0.72))); update("photos", [...form.photos, ...images]); }
    } catch { setMessage("No hemos podido procesar la imagen."); }
  };

  return <Drawer open={open} title={item ? "Editar publicación" : "Añadir publicación"} onClose={onClose} wide>
    <form onSubmit={submit} className="grid min-h-[calc(100vh-74px)] lg:grid-cols-[minmax(260px,0.75fr)_1.25fr]">
      <div className="border-b border-white/10 bg-black/15 p-5 lg:border-b-0 lg:border-r lg:p-7">
        <div className="mx-auto max-w-sm">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#191a1c] ring-1 ring-white/10">
            {form.coverImage ? <img src={form.coverImage} alt="Vista previa de portada" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600"><BookOpen className="h-12 w-12" /><span className="text-sm">Añade una portada</span></div>}
            <label className="absolute inset-x-3 bottom-3 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-black/80 text-sm text-white ring-1 ring-white/15 backdrop-blur hover:bg-black"><ImagePlus className="h-4 w-4" /> {form.coverImage ? "Cambiar portada" : "Subir portada"}<input type="file" accept="image/*" className="sr-only" onChange={(event) => upload(event.target.files, "coverImage")} /></label>
          </div>
          {form.coverImage ? <button type="button" onClick={() => update("coverImage", null)} className="mt-3 w-full text-xs text-zinc-500 hover:text-rose-300">Quitar portada</button> : null}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:p-7">
          <Field label="Título"><input required value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Título de la publicación" className={`${inputClass} w-full`} /></Field>
          <Field label="Número"><input value={form.issueNumber} onChange={(event) => update("issueNumber", event.target.value)} placeholder="Ej. 24, Especial verano..." className={`${inputClass} w-full`} /></Field>
          <Field label="Fecha de publicación"><div className="relative"><Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" /><input type="date" value={form.publicationDate} onChange={(event) => update("publicationDate", event.target.value)} className={`${inputClass} w-full pl-9`} /></div></Field>
          <Field label="Autor"><input list="publication-authors" value={form.author} onChange={(event) => update("author", event.target.value)} placeholder="Autor o editorial" className={`${inputClass} w-full`} /></Field>
          <Field label="Género"><input list="publication-genres" value={form.genre} onChange={(event) => update("genre", event.target.value)} placeholder="Cine, deportes..." className={`${inputClass} w-full`} /><datalist id="publication-genres">{commonGenres.map((value) => <option key={value} value={value} />)}</datalist></Field>
          <Field label="Tipo"><select required value={form.type} onChange={(event) => update("type", event.target.value)} className={`${inputClass} w-full`}><option value="">Selecciona un tipo</option>{commonTypes.map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Idioma"><input list="publication-languages" value={form.language} onChange={(event) => update("language", event.target.value)} placeholder="Castellano, inglés..." className={`${inputClass} w-full`} /><datalist id="publication-languages">{commonLanguages.map((value) => <option key={value} value={value} />)}</datalist></Field>

          <div className="sm:col-span-2">
            <p className="mb-2 text-xs uppercase text-zinc-500">Fotografías ({form.photos.length}/6)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.photos.map((photo, index) => <div key={`${photo.slice(-20)}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-md bg-black/20 ring-1 ring-white/10"><img src={photo} alt={`Fotografía ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => update("photos", form.photos.filter((_, photoIndex) => photoIndex !== index))} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/75 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100" aria-label="Eliminar fotografía"><X className="h-4 w-4" /></button></div>)}
              {form.photos.length < 6 ? <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 text-xs text-zinc-500 hover:border-amber-300/40 hover:text-amber-200"><ImagePlus className="h-5 w-5" /> Añadir fotos<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => upload(event.target.files, "photos")} /></label> : null}
            </div>
          </div>
          {message ? <p className="sm:col-span-2 rounded-md border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{message}</p> : null}
        </div>

        <div className="sticky bottom-0 mt-auto grid gap-2 border-t border-white/10 bg-[#101113]/95 p-4 backdrop-blur sm:grid-cols-[auto_1fr_auto]">
          {item ? <button type="button" disabled={saving} onClick={remove} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-rose-400/20 px-4 text-sm text-rose-300 hover:bg-rose-400/10"><Trash2 className="h-4 w-4" /> Eliminar</button> : <span />}
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-5 text-sm text-zinc-300 hover:bg-white/[0.05]"><ArrowLeft className="h-4 w-4" /> Volver a la revisteca</button>
          <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-400 px-6 text-sm font-medium text-zinc-950 hover:bg-amber-300 disabled:opacity-50"><Pencil className="h-4 w-4" /> {saving ? "Guardando..." : item ? "Guardar cambios" : "Añadir"}</button>
        </div>
      </div>
    </form>
  </Drawer>;
}

function Select({ value, onChange, icon, label, options, empty }: { value: string; onChange: (value: string) => void; icon: React.ReactElement<{ className?: string }>; label: string; options: string[][]; empty?: string }) {
  return <div className="relative shrink-0"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">{icon}</span><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className={`${inputClass} w-44 appearance-none pl-9`}>{empty ? <option value="">{empty}</option> : null}{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></div>;
}

function Empty({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-amber-300"><BookOpen className="h-6 w-6" /></div><h2 className="mt-5 text-lg font-medium text-zinc-100">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p><button type="button" onClick={onAction} className="mt-6 h-10 rounded-md bg-amber-400 px-4 text-sm font-medium text-zinc-950 hover:bg-amber-300">{action}</button></div>;
}

function Skeleton() { return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">{Array.from({ length: 10 }).map((_, index) => <div key={index}><div className="aspect-[3/4] animate-pulse rounded-md bg-white/[0.05]" /><div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-white/[0.05]" /></div>)}</div>; }

async function resizeImage(file: File, maxDimension: number, quality: number) {
  const source = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  return canvas.toDataURL("image/jpeg", quality);
}
