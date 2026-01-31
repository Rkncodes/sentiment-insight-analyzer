import { useState } from "react";

import "./App.css";
import SentimentCircle from "./components/SentimentCircle";
import WorkflowVisualizer from "./components/WorkflowVisualizer";
import YouTubeRecs from "./components/YouTubeRecs";

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

/* ---------- UI TEXT ---------- */
const UI_TEXT = {
  en: {
    feeling: "How are you feeling today?",
    placeholder: "Enter one statement per line (max 20)"
  }
};

export default function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uiLang = language === "auto" ? "en" : language;
  const t = UI_TEXT[uiLang];

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
            <span className="app-nav-logo">SENTIMENT INSIGHT ANALYZER</span>
            <span className="app-nav-subtitle">
              Multilingual sentiment analysis with structured and actionable guidance
            </span>
          </div>
          <div className="app-nav-links">
            <span className="app-nav-link">Home</span>
            <span className="app-nav-link">About</span>
            <span className="app-nav-link">Doctors</span>
            <span className="app-nav-link">Contact</span>
          </div>
        </div>
      </nav>

      {/* ---------- MAIN ---------- */}
      <main className="app-main-section">
        <div className="app-container">
          {/* ---------- INPUT ---------- */}
          <section className="app-input-box">
            <div className="app-input-header-row">
              <h2 className="app-input-heading">Input Statements</h2>

              <div className="app-input-lang-row">
                <span className="app-input-label">Choose language</span>
                <select
                  className="app-select"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map(l => (
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
              onChange={e => setText(e.target.value)}
              placeholder={t.placeholder}
            />

            <button
              className="app-analyze-btn"
              onClick={analyze}
              disabled={loading}
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>

            {error && <p className="app-input-error">{error}</p>}
          </section>

          {/* ---------- RESULTS ---------- */}
          <div className="app-results">
            {!aggregate && !loading && (
              <p className="app-results-empty">
                Results will appear here after analysis.
              </p>
            )}

            {loading && (
              <p className="app-results-loading">
                Analyzing emotional tone…
              </p>
            )}

            {aggregate && (
              <>
                {/* SENTIMENT CIRCLE */}
                <SentimentCircle severity={aggregate.severity} />

                {/* RESULTS CARD */}
                <section className="app-results-section">
                  <h2 className="app-results-title">Analysis Results</h2>

                  <div className="app-results-report">
                    <p className="app-results-line">
                      <span className="app-results-label">Text:</span>
                      {aggregate.text}
                    </p>

                    <p className="app-results-line">
                      <span className="app-results-label">Sentiment:</span>
                      {aggregate.sentiment}
                    </p>

                    <p className="app-results-line">
                      <span className="app-results-label">Severity:</span>
                      <span
                        className={`app-results-severity-pill app-severity-${aggregate.severity
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {aggregate.severity}
                      </span>
                    </p>

                    <p className="app-results-line">
                      <span className="app-results-label">Confidence:</span>
                      {aggregate.confidence}
                    </p>
                  </div>

                  {/* GUIDED ROADMAP CARD */}
                  <div className="app-results-roadmap-card">
                    <h3 className="app-results-roadmap-title">
                      GUIDED ROADMAP
                    </h3>
                    <p className="app-results-roadmap-subtitle">
                      Step-by-step suggestions based on your current emotional state
                    </p>

                    <WorkflowVisualizer steps={aggregate.roadmap} />
                  </div>
                </section>

                {/* YOUTUBE */}
                <YouTubeRecs videos={aggregate.youtube_recommendations} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="app-footer">
        This system provides non-clinical and informational guidance only
      </footer>
    </div>
  );
}
