import { useState } from "react";
import type { Preferences } from "../types";

interface Props {
  onSubmit: (data: Preferences) => void;
  loading: boolean;
}

const initialState: Preferences = {
  contentType: "movies",
  genres: "",
  actors: "",
};

export default function PreferenceForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<Preferences>(initialState);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="preferences-card" onSubmit={handleSubmit}>
      <h2 className="panel-title">PREFERENCES & FILTERS</h2>

      <div className="toggle-group">
        <button type="button" className="toggle-btn active">
          Películas
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