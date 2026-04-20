import { useState } from "react";
import PreferenceForm from "./components/PreferenceForm";
import RecommendationCard from "./components/RecommendationCard";
import { getRecommendations } from "./services/recommender";
import type { Preferences, RecommendationItem } from "./types";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [lastPreferences, setLastPreferences] = useState<Preferences | null>(null);

  async function fetchPage(preferences: Preferences, page: number) {
    try {
      setLoading(true);
      setError("");

      const response = await getRecommendations(preferences, page);

      setResults(response.results);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al generar las recomendaciones.");
      setResults([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(preferences: Preferences) {
    setLastPreferences(preferences);
    await fetchPage(preferences, 1);
  }

  async function handlePreviousPage() {
    if (!lastPreferences || currentPage <= 1) return;
    await fetchPage(lastPreferences, currentPage - 1);
  }

  async function handleNextPage() {
    if (!lastPreferences || currentPage >= totalPages) return;
    await fetchPage(lastPreferences, currentPage + 1);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-icon">🎬</div>
          <div>
            <p className="brand-label">App Name</p>
            <h1 className="brand-title">Películas IA</h1>
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
            {totalResults > 0 && (
              <p className="results-count">
                {totalResults} resultados encontrados • Página {currentPage} de {totalPages}
              </p>
            )}
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
            <>
              <div className="results-grid">
                {results.map((item) => (
                  <RecommendationCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                  />
                ))}
              </div>

              {results.length > 0 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={handlePreviousPage}
                    disabled={loading || currentPage === 1}
                  >
                    Anterior
                  </button>

                  <span className="pagination-info">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    onClick={handleNextPage}
                    disabled={loading || currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
}