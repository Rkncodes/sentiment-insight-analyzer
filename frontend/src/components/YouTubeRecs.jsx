import { useState } from "react";
import SentimentCircle from "./components/SentimentCircle";
import WorkflowVisualizer from "./components/WorkflowVisualizer";
import YouTubeRecommendations from "./components/YouTubeRecommendations";

function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Sentiment Insight Analyzer</h1>
      <p>Multilingual sentiment analysis with structured, actionable guidance</p>

      <h3>How are you feeling today?</h3>

      <select
        value={language}
        onChange={e => setLanguage(e.target.value)}
      >
        <option value="auto">Auto-detect</option>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
        <option value="bn">Bengali</option>
        <option value="mr">Marathi</option>
        <option value="gu">Gujarati</option>
        <option value="pa">Punjabi</option>
        <option value="or">Odia</option>
        <option value="as">Assamese</option>
      </select>

      <textarea
        rows={5}
        placeholder="Enter one statement per line (max 20)"
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ width: "100%", marginTop: "12px" }}
      />

      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <>
          <SentimentCircle
            sentiment={result.sentiment}
            confidence={result.confidence}
            severity={result.severity}
          />

          <WorkflowVisualizer
            roadmap={result.roadmap}
            severity={result.severity}
          />

          <YouTubeRecommendations sentiment={result.sentiment} />
        </>
      )}
    </div>
  );
}

export default App;
