export type ContentType = "movies";

export interface Preferences {
  contentType: ContentType;
  genres: string;
  actors: string;
}

export interface RecommendationItem {
  id: string;
  type: "movie";
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  year?: string;
  rating?: number;
  extraInfo?: string;
  link: string;
  reason: string;
}

export interface RecommendationResponse {
  results: RecommendationItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}