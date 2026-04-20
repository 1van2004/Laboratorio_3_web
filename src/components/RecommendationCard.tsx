import { useState } from "react";
import type { RecommendationItem } from "../types";

interface Props {
  item: RecommendationItem;
}

const DESCRIPTION_LIMIT = 140;

export default function RecommendationCard({ item }: Props) {
  const [expanded, setExpanded] = useState(false);

  const fullDescription = item.description || "Sin descripción disponible.";
  const isLongDescription = fullDescription.length > DESCRIPTION_LIMIT;

  const visibleDescription =
    expanded || !isLongDescription
      ? fullDescription
      : `${fullDescription.slice(0, DESCRIPTION_LIMIT).trim()}...`;

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

        <div className="card-description-box">
          <p className={`card-description ${expanded ? "expanded" : ""}`}>
            {visibleDescription}
          </p>

          {isLongDescription && (
            <button
              type="button"
              className="card-toggle-btn"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>

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