import type { Preferences, RecommendationItem } from "../types";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const GOOGLE_BOOKS_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

function splitAndClean(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildBooksQuery(preferences: Preferences): string {
  const authors = splitAndClean(preferences.authors);
  const genres = splitAndClean(preferences.genres);

  const queryParts: string[] = [];

  authors.forEach((author) => {
    queryParts.push(`inauthor:${author}`);
  });

  genres.forEach((genre) => {
    queryParts.push(`subject:${genre}`);
  });

  if (queryParts.length === 0) {
    queryParts.push("best seller");
  }

  return queryParts.join(" ");
}

export async function fetchBookRecommendations(
  preferences: Preferences
): Promise<RecommendationItem[]> {
  const q = buildBooksQuery(preferences);

  const url = new URL(GOOGLE_BOOKS_API);
  url.searchParams.set("q", q);
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("printType", "books");

  if (GOOGLE_BOOKS_KEY) {
    url.searchParams.set("key", GOOGLE_BOOKS_KEY);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("No se pudieron obtener libros recomendados.");
  }

  const data = await response.json();

  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((item: any): RecommendationItem => {
    const info = item.volumeInfo ?? {};
    const authorsText = Array.isArray(info.authors)
      ? info.authors.join(", ")
      : "Autor no disponible";

    const categoriesText = Array.isArray(info.categories)
      ? info.categories.join(", ")
      : "Sin categoría";

    return {
      id: item.id,
      type: "book",
      title: info.title ?? "Sin título",
      subtitle: authorsText,
      description: info.description ?? "Sin descripción disponible.",
      image: info.imageLinks?.thumbnail,
      year: info.publishedDate ? String(info.publishedDate).slice(0, 4) : "",
      extraInfo: categoriesText,
      link: info.infoLink ?? "#",
      reason: `Coincide con tus autores o géneros preferidos: ${q}`,
    };
  });
}