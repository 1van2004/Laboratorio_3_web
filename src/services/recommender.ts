import type { Preferences, RecommendationItem } from "../types";
import { fetchMovieRecommendations } from "./movies";

export async function getRecommendations(
  preferences: Preferences
): Promise<RecommendationItem[]> {
  const results: RecommendationItem[] = [];


  if (preferences.contentType === "movies" || preferences.contentType === "both") {
    const movies = await fetchMovieRecommendations(preferences);
    results.push(...movies);
  }

  return results;
}