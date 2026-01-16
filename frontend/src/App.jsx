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
      setError("Please enter at least one line of text.");
      return;
    }

    if (texts.length > 20) {
      setError("Maximum 20 texts allowed per request.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ texts })
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Failed to analyze text. Is the backend running?");
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
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Clinical Sentiment Risk Scoring</h2>

      <textarea
        rows={6}
        style={{ width: "100%", padding: "10px" }}
        placeholder="Enter one text per line..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{ marginTop: "12px", padding: "10px 20px" }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      {results.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px" }}>Results</h3>

          <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Text</th>
                <th>Risk Level</th>
                <th>Risk Score</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.text}</td>
                  <td>{r.risk_level}</td>
                  <td>{r.risk_score}</td>
                  <td>{r.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginTop: "20px" }}>Session Summary</h4>
          <p>Total analyzed: {summary.total}</p>
          <ul>
            {Object.entries(summary)
              .filter(([k]) => k !== "total")
              .map(([k, v]) => (
                <li key={k}>{k}: {v}</li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
