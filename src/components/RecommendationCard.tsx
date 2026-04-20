import type { RecommendationItem } from "../types";

interface Props {
  item: RecommendationItem;
}

export default function RecommendationCard({ item }: Props) {
  return (
    <article className="recommendation-card">
      <div className="card-image-wrapper">
        {item.image ? (
          <img src={item.image} alt={item.title} className="card-image" />
        ) : (
          <div className="card-image placeholder">Sin imagen</div>
        )}
      </div>

      <div className="card-body">
        <div className="card-top-row">
          <h3 className="card-title">{item.title}</h3>
          {typeof item.rating === "number" && (
            <span className="card-rating">⭐ {item.rating.toFixed(1)}</span>
          )}
        </div>

        <p className="card-type">
          {item.type === "movie" ? "Película" : "Libro"}
          {item.year ? ` • ${item.year}` : ""}
        </p>

        <p className="card-description">
          {item.description || "Sin descripción disponible."}
        </p>

        <p className="card-reason">{item.reason}</p>

        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="details-btn"
        >
          VER DETALLES
        </a>
      </div>
    </article>
  );
}