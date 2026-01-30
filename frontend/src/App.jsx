import { useState } from "react";

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

/* ---------- APP ---------- */
export default function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = UI_TEXT.en;

  const analyze = async () => {
    setError("");
    setResults([]);

    const texts = text
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean);

    if (texts.length === 0) {
      setError("Please enter at least one statement.");
      return;
    }

    if (texts.length > 20) {
      setError("Maximum 20 statements allowed.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts })
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError("Unable to reach backend service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef4ff", padding: "40px" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.1)"
        }}
      >
        <h1 style={{ fontSize: "30px", color: "#0f172a" }}>
          Sentiment Insight Analyzer
        </h1>
        <p style={{ color: "#334155" }}>
          Multilingual sentiment analysis with structured, actionable guidance.
        </p>

        {/* INPUT */}
        <section style={{ marginTop: "30px", border: "1.5px solid #bfdbfe", borderRadius: "12px", padding: "24px" }}>
          <h3>Input Statements</h3>

          <label style={{ fontWeight: 600 }}>{t.feeling}</label>

          <div style={{ marginTop: "10px" }}>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #c7d2fe" }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <textarea
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t.placeholder}
            style={{
              marginTop: "14px",
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              borderRadius: "8px",
              border: "1px solid #c7d2fe"
            }}
          />

          <button
            onClick={analyze}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "10px 24px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "6px",
              border: "none"
            }}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>

          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        </section>

        {/* RESULTS */}
        {results.length > 0 && (
          <section style={{ marginTop: "30px", border: "1.5px solid #bfdbfe", borderRadius: "12px", padding: "24px" }}>
            <h3>Analysis Results</h3>

            {results.map((r, i) => (
              <div key={i} style={{ marginTop: "20px", background: "#f8fafc", padding: "16px", borderRadius: "10px" }}>
                <p><b>Text:</b> {r.text}</p>
                <p><b>Sentiment:</b> {r.sentiment}</p>
                <p><b>Severity:</b> {r.severity}</p>
                <p><b>Confidence:</b> {r.confidence}</p>

                <p style={{ fontWeight: 600, marginTop: "10px" }}>Recommended Workflow:</p>
                <ul>
                  {r.roadmap.map((s, idx) => (
                    <li key={idx}>{s.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* YOUTUBE RECOMMENDATIONS */}
        {results[0]?.youtube_recommendations?.length > 0 && (
          <section style={{ marginTop: "32px" }}>
            <h3>Recommended Videos</h3>

            <div style={{ display: "flex", gap: "20px", overflowX: "auto" }}>
              {results[0].youtube_recommendations.map((v, idx) => (
                <a
                  key={idx}
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ minWidth: "320px", textDecoration: "none" }}
                >
                  <div style={{ borderRadius: "14px", overflow: "hidden" }}>
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      style={{ width: "100%", height: "180px", objectFit: "cover" }}
                    />
                  </div>
                  <p style={{ fontWeight: 600, color: "#0f172a", marginTop: "8px" }}>
                    {v.title}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        <p style={{ marginTop: "24px", fontSize: "12px", color: "#475569" }}>
          This system provides non-clinical, informational guidance only.
        </p>
      </div>
    </div>
  );
}
