import type { Preferences, RecommendationResponse } from "../types";
import { fetchMovieRecommendations } from "./movies";

export async function getRecommendations(
  preferences: Preferences,
  page = 1
): Promise<RecommendationResponse> {
  return fetchMovieRecommendations(preferences, page);
}