import { useState } from "react";

import "./App.css";
import SentimentCircle from "./components/SentimentCircle";
import WorkflowVisualizer from "./components/WorkflowVisualizer";
import YouTubeRecs from "./components/YouTubeRecs";
import { UI_TEXT } from "./i18n/uiText";

/* ---------- LANGUAGE CONFIG ---------- */
const LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "or", label: "Odia" },
  { code: "as", label: "Assamese" }
];

export default function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------- SAFE UI TEXT ---------- */
  const uiLang = UI_TEXT[language] ? language : "en";
  const t = UI_TEXT[uiLang];

  /* ---------- CLEAN RESET ON LANGUAGE SWITCH ---------- */
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setText("");
    setResults([]);
    setError("");
    setLoading(false);
  };

  /* ---------- ANALYZE ---------- */
  const analyze = async () => {
    setError("");
    setResults([]);

    if (!text.trim()) {
      setError("Please enter at least one statement.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      setResults([data]);
    } catch {
      setError("Unable to reach backend service.");
    } finally {
      setLoading(false);
    }
  };

  const aggregate = results[0];

  return (
    <div className="app-root">
      {/* ---------- NAVBAR ---------- */}
      <nav className="app-navbar">
        <div className="app-nav-inner">
          <div className="app-nav-brand">
            <span className="app-nav-logo">{t.brand}</span>
            <span className="app-nav-subtitle">{t.subtitle}</span>
          </div>

          <div className="app-nav-links">
            <span className="app-nav-link">{t.navAbout}</span>
            <span className="app-nav-link">{t.navDoctors}</span>
            <span className="app-nav-link">{t.navContact}</span>
          </div>
        </div>
      </nav>

      {/* ---------- MAIN ---------- */}
      <main className="app-main-section">
        <div className="app-container">
          {/* ---------- INPUT ---------- */}
          <section className="app-input-box">
            <div className="app-input-header-row">
              <h2 className="app-input-heading">{t.inputHeading}</h2>

              <div className="app-input-lang-row">
                <span className="app-input-label">{t.chooseLanguage}</span>
                <select
                  className="app-select"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="app-input-prompt">{t.feeling}</p>

            <textarea
              className="app-textarea"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
            />

            <button
              className="app-analyze-btn"
              onClick={analyze}
              disabled={loading}
            >
              {loading ? t.analyzing : t.analyze}
            </button>

            {error && <p className="app-input-error">{error}</p>}
          </section>

          {/* ---------- RESULTS ---------- */}
          <div className="app-results">
            {!aggregate && !loading && (
              <p className="app-results-empty">{t.resultsEmpty}</p>
            )}

            {loading && (
              <p className="app-results-loading">{t.loadingText}</p>
            )}

            {aggregate && (
              <>
                <SentimentCircle severity={aggregate.severity} />

                <section className="app-results-section">
                  {/* ---------- ANALYSIS RESULTS CARD ---------- */}
                  <div className="app-results-roadmap-card">
                    <h3 className="app-results-roadmap-title">
                      {t.resultsTitle}
                    </h3>

                    <div className="app-results-card">
                      <div className="app-results-row">
                        <span className="app-results-label">{t.textLabel}</span>
                        <span className="app-results-value">
                          {aggregate.text}
                        </span>
                      </div>

                      <div className="app-results-row">
                        <span className="app-results-label">
                          {t.sentimentLabel}
                        </span>
                        <span className="app-results-value">
                          {aggregate.sentiment}
                        </span>
                      </div>

                      <div className="app-results-row">
                        <span className="app-results-label">
                          {t.severityLabel}
                        </span>
                        <span
                          className={`app-results-severity-pill app-severity-${aggregate.severity
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {aggregate.severity}
                        </span>
                      </div>

                      <div className="app-results-row">
                        <span className="app-results-label">
                          {t.confidenceLabel}
                        </span>
                        <span className="app-results-value">
                          {aggregate.confidence}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ---------- GUIDED ROADMAP CARD ---------- */}
                  <div className="app-results-roadmap-card">
                    <h3 className="app-results-roadmap-title">
                      {t.roadmapTitle}
                    </h3>
                    <p className="app-results-roadmap-subtitle">
                      {t.roadmapSubtitle}
                    </p>

                    <WorkflowVisualizer steps={aggregate.roadmap} />
                  </div>
                </section>

                <YouTubeRecs
                  videos={aggregate.youtube_recommendations}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="app-footer">{t.footer}</footer>
    </div>
  );
}
