import type { Preferences, RecommendationItem } from "../types";
import { fetchBookRecommendations } from "./books";
import { fetchMovieRecommendations } from "./movies";

export async function getRecommendations(
  preferences: Preferences
): Promise<RecommendationItem[]> {
  const results: RecommendationItem[] = [];

  if (preferences.contentType === "books" || preferences.contentType === "both") {
    const books = await fetchBookRecommendations(preferences);
    results.push(...books);
  }

  if (preferences.contentType === "movies" || preferences.contentType === "both") {
    const movies = await fetchMovieRecommendations(preferences);
    results.push(...movies);
  }

  return results;
}