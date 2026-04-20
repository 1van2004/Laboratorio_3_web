import { useState } from "react";
import type { Preferences, ContentType } from "../types";

interface Props {
  onSubmit: (data: Preferences) => void;
  loading: boolean;
}

const initialState: Preferences = {
  contentType: "both",
  genres: "",
  authors: "",
  actors: "",
};

export default function PreferenceForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<Preferences>(initialState);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setContentType(type: ContentType) {
    setForm((prev) => ({ ...prev, contentType: type }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="preferences-card" onSubmit={handleSubmit}>
      <h2 className="panel-title">PREFERENCES & FILTERS</h2>

      <div className="toggle-group">
        <button
          type="button"
          className={`toggle-btn ${
            form.contentType === "movies" ? "active" : ""
          }`}
          onClick={() => setContentType("movies")}
        >
          Películas
        </button>

        <button
          type="button"
          className={`toggle-btn ${
            form.contentType === "books" ? "active" : ""
          }`}
          onClick={() => setContentType("books")}
        >
          Libros
        </button>

        <button
          type="button"
          className={`toggle-btn ${
            form.contentType === "both" ? "active" : ""
          }`}
          onClick={() => setContentType("both")}
        >
          Ambos
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="genres">Géneros Favoritos</label>
        <input
          id="genres"
          type="text"
          name="genres"
          placeholder="Ej: acción, fantasía, drama"
          value={form.genres}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="authors">Autores Favoritos</label>
        <input
          id="authors"
          type="text"
          name="authors"
          placeholder="Ej: Stephen King, Tolkien"
          value={form.authors}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="actors">Actores Favoritos</label>
        <input
          id="actors"
          type="text"
          name="actors"
          placeholder="Ej: Tom Hanks, Emma Stone"
          value={form.actors}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="generate-btn" disabled={loading}>
        {loading ? "Generando..." : "GENERAR RECOMENDACIONES"}
      </button>
    </form>
  );
}