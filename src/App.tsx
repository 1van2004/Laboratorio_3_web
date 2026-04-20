  import { useState } from "react";
  import PreferenceForm from "./components/PreferenceForm";
  import RecommendationCard from "./components/RecommendationCard";
  import { getRecommendations } from "./services/recommender";
  import type { Preferences, RecommendationItem } from "./types";

  export default function App() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<RecommendationItem[]>([]);
    const [error, setError] = useState("");

    async function handleSearch(preferences: Preferences) {
      try {
        setLoading(true);
        setError("");

        const recommendations = await getRecommendations(preferences);
        setResults(recommendations);
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al generar las recomendaciones.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    return (
      <main className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-icon">🎬</div>
            <div>
              <p className="brand-label">App Name</p>
              <h1 className="brand-title">Películas & Libros IA</h1>
            </div>
          </div>

        </header>

        <section className="content-layout">
          <aside className="sidebar-panel">
            <PreferenceForm onSubmit={handleSearch} loading={loading} />
          </aside>

          <section className="main-panel">
            <div className="section-header">
              <h2>TUS RECOMENDACIONES PERSONALIZADAS</h2>
            </div>

            {error && <p className="error-message">{error}</p>}

            {results.length === 0 && !loading && !error ? (
              <div className="empty-state">
                <p>
                  Completa tus preferencias y presiona{" "}
                  <strong>Generar recomendaciones</strong>.
                </p>
              </div>
            ) : (
              <div className="results-grid">
                {results.map((item) => (
                  <RecommendationCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }