export type ContentType = "movies" | "books" | "both";

export interface Preferences {
  contentType: ContentType;
  genres: string;
  authors: string;
  actors: string;
}

export interface RecommendationItem {
  id: string;
  type: "movie" | "book";
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