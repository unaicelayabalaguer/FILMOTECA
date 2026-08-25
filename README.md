# Filmoteca

Aplicación web personal para gestionar una estantería digital de películas vistas.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Neon
- TMDB API

## Configuración

1. Crea `.env` a partir de `.env.example`.
2. Define `DATABASE_URL` con tu connection string de Neon/PostgreSQL.
3. Define `TMDB_API_KEY` con tu API key de TMDB.
4. Sincroniza el schema:

```bash
npx prisma db push
```

5. Arranca la app:

```bash
npm run dev
```

## Modelo de datos

La película de TMDB se guarda una sola vez por `tmdbId`. Los datos personales viven en `UserMovie` y cada visionado en `WatchHistory`, por lo que una misma película puede tener múltiples fechas, puntuaciones y comentarios.

Géneros y reparto se guardan como JSON serializado en `genresJson` y `castJson`, y la API los expone al frontend como arrays.

## Rutas principales

- `GET /api/library`: biblioteca personal con búsqueda, filtros y ordenación.
- `POST /api/library`: añade una película desde TMDB y crea el primer visionado.
- `GET /api/library/:id`: ficha de película.
- `PATCH /api/library/:id`: edita favorita y último visionado.
- `DELETE /api/library/:id`: elimina la película de la estantería del usuario.
- `POST /api/library/:id/watches`: añade un nuevo visionado.
- `GET /api/tmdb/search`: busca películas en TMDB.
