import type {
  Preferences,
  RecommendationItem,
  RecommendationResponse,
} from "../types";

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

function splitAndClean(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function tmdbFetch(endpoint: string) {
  const response = await fetch(`${TMDB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error consultando TMDb.");
  }

  return response.json();
}

async function getGenreMap(): Promise<Map<string, number>> {
  const data = await tmdbFetch("/genre/movie/list?language=es-ES");
  const map = new Map<string, number>();

  for (const genre of data.genres ?? []) {
    const name = String(genre.name ?? "");
    map.set(normalizeText(name), genre.id);
  }

  return map;
}

async function searchPersonIds(actorNames: string[]): Promise<number[]> {
  const ids: number[] = [];

  for (const actorName of actorNames) {
    const data = await tmdbFetch(
      `/search/person?query=${encodeURIComponent(actorName)}&language=es-ES&page=1`
    );

    const firstMatch = data.results?.[0]?.id;
    if (typeof firstMatch === "number") {
      ids.push(firstMatch);
    }
  }

  return ids;
}

function buildReason(genres: string[], actors: string[]): string {
  if (genres.length > 0 && actors.length > 0) {
    return `Coincide con los géneros ${genres.join(", ")} y con actores relacionados como ${actors.join(", ")}.`;
  }

  if (genres.length > 0) {
    return `Coincide con tus géneros preferidos: ${genres.join(", ")}.`;
  }

  if (actors.length > 0) {
    return `Coincide con actores relacionados como ${actors.join(", ")}.`;
  }

  return "Se muestra por popularidad porque no ingresaste filtros específicos.";
}

export async function fetchMovieRecommendations(
  preferences: Preferences,
  page = 1
): Promise<RecommendationResponse> {
  const genres = splitAndClean(preferences.genres);
  const actors = splitAndClean(preferences.actors);

  const genreMap = await getGenreMap();

  const genreIds = genres
    .map((genre) => genreMap.get(normalizeText(genre)))
    .filter((id): id is number => typeof id === "number");

  const actorIds = actors.length > 0 ? await searchPersonIds(actors) : [];

  const params = new URLSearchParams();
  params.set("language", "es-ES");
  params.set("page", String(page));
  params.set("include_adult", "false");
  params.set("include_video", "false");

  // Mejora importante:
  // - si hay filtros, usamos discover con filtros reales
  // - evitamos resultados demasiado raros con vote_count.gte
  // - usamos popularity.desc para algo más estable
  params.set("sort_by", "popularity.desc");
  params.set("vote_count.gte", "200");

  if (genreIds.length > 0) {
    params.set("with_genres", genreIds.join(","));
  }

  if (actorIds.length > 0) {
    // pipe = OR entre actores
    params.set("with_cast", actorIds.join("|"));
  }

  let endpoint = `/discover/movie?${params.toString()}`;

  // Si el usuario no puso nada, seguimos mostrando populares, pero paginados
  if (genreIds.length === 0 && actorIds.length === 0) {
    endpoint = `/movie/popular?language=es-ES&page=${page}`;
  }

  const data = await tmdbFetch(endpoint);

  const movies = Array.isArray(data.results) ? data.results : [];

const results: RecommendationItem[] = movies.map((movie: any): RecommendationItem => ({
  id: String(movie.id),
  type: "movie",
  title: movie.title ?? "Sin título",
  subtitle:
    movie.original_title && movie.original_title !== movie.title
      ? movie.original_title
      : "",
  description: movie.overview ?? "Sin descripción disponible.",
  image: movie.poster_path
    ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
    : undefined,
  year: movie.release_date ? String(movie.release_date).slice(0, 4) : "",
  rating:
    typeof movie.vote_average === "number" ? movie.vote_average : undefined,
  extraInfo:
    genres.length > 0
      ? `Géneros buscados: ${genres.join(", ")}`
      : "Resultados de TMDb",
  link: `https://www.themoviedb.org/movie/${movie.id}`,
  reason: buildReason(genres, actors),
}));

  return {
    results,
    page: data.page ?? page,
    totalPages: Math.min(data.total_pages ?? 1, 500),
    totalResults: data.total_results ?? results.length,
  };
}