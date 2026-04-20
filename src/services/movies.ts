import type { Preferences, RecommendationItem } from "../types";

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;

function splitAndClean(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
    map.set(String(genre.name).toLowerCase(), genre.id);
  }

  return map;
}

async function searchPersonId(actorName: string): Promise<number | null> {
  const data = await tmdbFetch(
    `/search/person?query=${encodeURIComponent(actorName)}&language=es-ES&page=1`
  );

  return data.results?.[0]?.id ?? null;
}

export async function fetchMovieRecommendations(
  preferences: Preferences
): Promise<RecommendationItem[]> {
  const genres = splitAndClean(preferences.genres);
  const actors = splitAndClean(preferences.actors);

  const genreMap = await getGenreMap();
  const genreIds = genres
    .map((genre) => genreMap.get(genre.toLowerCase()))
    .filter((id): id is number => typeof id === "number");

  let movies: any[] = [];

  if (actors.length > 0) {
    const personId = await searchPersonId(actors[0]);

    if (personId) {
      const credits = await tmdbFetch(`/person/${personId}/movie_credits?language=es-ES`);
      movies = Array.isArray(credits.cast) ? credits.cast : [];

      if (genreIds.length > 0) {
        movies = movies.filter((movie) =>
          Array.isArray(movie.genre_ids) &&
          genreIds.some((genreId) => movie.genre_ids.includes(genreId))
        );
      }

      movies = movies
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 10);
    }
  }

  if (movies.length === 0 && genreIds.length > 0) {
    const data = await tmdbFetch(
      `/discover/movie?with_genres=${genreIds.join(",")}&sort_by=popularity.desc&language=es-ES&page=1`
    );

    movies = Array.isArray(data.results) ? data.results.slice(0, 10) : [];
  }

  if (movies.length === 0) {
    const data = await tmdbFetch(`/movie/popular?language=es-ES&page=1`);
    movies = Array.isArray(data.results) ? data.results.slice(0, 10) : [];
  }

  return movies.map((movie): RecommendationItem => ({
    id: String(movie.id),
    type: "movie",
    title: movie.title ?? "Sin título",
    subtitle: movie.original_title && movie.original_title !== movie.title
      ? movie.original_title
      : "",
    description: movie.overview ?? "Sin descripción disponible.",
    image: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined,
    year: movie.release_date ? String(movie.release_date).slice(0, 4) : "",
    rating: typeof movie.vote_average === "number" ? movie.vote_average : undefined,
    extraInfo: genres.length > 0 ? `Géneros buscados: ${genres.join(", ")}` : "Popular en TMDb",
    link: `https://www.themoviedb.org/movie/${movie.id}`,
    reason:
      actors.length > 0
        ? `Te la recomiendo porque coincide con el actor "${actors[0]}" y tus géneros.`
        : genres.length > 0
        ? `Te la recomiendo porque coincide con tus géneros preferidos: ${genres.join(", ")}.`
        : "Te la recomiendo porque no ingresaste filtros y se tomó contenido popular.",
  }));
}