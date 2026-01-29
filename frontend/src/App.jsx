import { useState } from "react";

function App() {
  const [textInput, setTextInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");
    setResults([]);

    const texts = textInput
      .split("\n")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (texts.length === 0) {
      setError("Please enter at least one statement.");
      return;
    }

    if (texts.length > 20) {
      setError("Maximum 20 statements allowed per request.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts })
      });

      if (!response.ok) {
        throw new Error("API failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch {
      setError("Unable to reach backend service.");
    } finally {
      setLoading(false);
    }
  };

  const summary = results.reduce(
    (acc, r) => {
      acc.total += 1;
      acc[r.risk_level] = (acc[r.risk_level] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  return (
    <div
      style={{
        maxWidth: "1200px",
        width: "96%",
        margin: "32px auto",
        padding: "32px",
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.1)"
      }}
    >
      {/* Title */}
      <h2 style={{ fontSize: "26px", marginBottom: "6px", color: "#0f172a" }}>
        Clinical Sentiment Risk Scoring
      </h2>
      <p style={{ marginTop: 0, fontSize: "14px", color: "#334155" }}>
        Batch analysis of text for emotional risk signals using machine learning
        inference and semantic safety rules.
      </p>

      {/* INPUT SECTION */}
      <div
        style={{
          marginTop: "26px",
          border: "1.5px solid #bfdbfe",
          borderRadius: "12px",
          padding: "20px"
        }}
      >
        <div style={{ borderLeft: "4px solid #2563eb", paddingLeft: "14px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "#0f172a" }}>
            Input Statements
          </h3>

          <textarea
            rows={6}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter one statement per line (max 20)…"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #c7d2fe"
            }}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "10px 22px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff"
            }}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>

          {error && (
            <p style={{ marginTop: "10px", color: "#b91c1c", fontSize: "14px" }}>
              {error}
            </p>
          )}
        </div>
      </div>

      {/* RESULTS SECTION */}
      {results.length > 0 && (
        <div
          style={{
            marginTop: "34px",
            border: "1.5px solid #bfdbfe",
            borderRadius: "12px",
            padding: "20px"
          }}
        >
          <div style={{ borderLeft: "4px solid #2563eb", paddingLeft: "14px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "14px", color: "#0f172a" }}>
              Results
            </h3>

            <table
              width="100%"
              style={{
                borderCollapse: "collapse",
                fontSize: "14px",
                tableLayout: "fixed"
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "45%", textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                    Text
                  </th>
                  <th style={{ width: "15%", textAlign: "center", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                    Risk Level
                  </th>
                  <th style={{ width: "10%", textAlign: "center", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                    Score
                  </th>
                  <th style={{ width: "30%", textAlign: "left", padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "10px", textAlign: "left", verticalAlign: "top" }}>
                      {r.text}
                    </td>

                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          background:
                            r.risk_level === "High Concern"
                              ? "#fee2e2"
                              : r.risk_level === "Uncertain"
                              ? "#fef3c7"
                              : "#dcfce7",
                          color:
                            r.risk_level === "High Concern"
                              ? "#991b1b"
                              : r.risk_level === "Uncertain"
                              ? "#92400e"
                              : "#166534"
                        }}
                      >
                        {r.risk_level}
                      </span>
                    </td>

                    <td style={{ padding: "10px", textAlign: "center" }}>
                      {r.risk_score}
                    </td>

                    <td style={{ padding: "10px", textAlign: "left" }}>
                      {r.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SESSION SUMMARY */}
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #c7d2fe"
              }}
            >
              <h4 style={{ fontSize: "15px", marginBottom: "6px", color: "#0f172a" }}>
                Session Summary
              </h4>
              <p style={{ fontSize: "13px", color: "#334155" }}>
                Total statements analyzed: {summary.total}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <div
        style={{
          marginTop: "36px",
          padding: "16px",
          fontSize: "12px",
          color: "#334155",
          background: "#f1f5f9",
          borderRadius: "10px"
        }}
      >
        This system performs per-input risk inference using machine learning and
        semantic safety rules. It does not provide diagnosis, treatment, or
        long-term analytics.
      </div>
    </div>
  );
}

export default App;
