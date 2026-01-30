import { useState } from "react";

import SentimentCircle from "./components/SentimentCircle";
import WorkflowSteps from "./components/WorkflowSteps";
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
  },
  hi: {
    feeling: "आज आप कैसा महसूस कर रहे हैं?",
    placeholder: "प्रत्येक पंक्ति में एक वाक्य लिखें (अधिकतम 20)"
  },
  bn: {
    feeling: "আজ আপনি কেমন অনুভব করছেন?",
    placeholder: "প্রতি লাইনে একটি বাক্য লিখুন (সর্বোচ্চ ২০)"
  },
  mr: {
    feeling: "आज तुम्ही कसे वाटत आहात?",
    placeholder: "प्रत्येक ओळीत एक वाक्य लिहा (कमाल 20)"
  },
  gu: {
    feeling: "આજે તમે કેવી રીતે અનુભવો છો?",
    placeholder: "દર લાઇનમાં એક વાક્ય લખો (મહત્તમ 20)"
  },
  pa: {
    feeling: "ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?",
    placeholder: "ਹਰ ਲਾਈਨ ਵਿੱਚ ਇੱਕ ਵਾਕ ਲਿਖੋ (ਅਧਿਕਤਮ 20)"
  },
  ta: {
    feeling: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    placeholder: "ஒரு வரியில் ஒரு வாக்கியம் எழுதுங்கள் (அதிகபட்சம் 20)"
  },
  te: {
    feeling: "ఈ రోజు మీరు ఎలా అనుభవిస్తున్నారు?",
    placeholder: "ప్రతి వరుసలో ఒక వాక్యం రాయండి (గరిష్టంగా 20)"
  },
  kn: {
    feeling: "ಇಂದು ನೀವು ಹೇಗಿದ್ದೀರಿ?",
    placeholder: "ಪ್ರತಿ ಸಾಲಿಗೆ ಒಂದು ವಾಕ್ಯ ಬರೆಯಿರಿ (ಗರಿಷ್ಠ 20)"
  },
  or: {
    feeling: "ଆଜି ଆପଣ କେମିତି ଅନୁଭବ କରୁଛନ୍ତି?",
    placeholder: "ପ୍ରତ୍ୟେକ ଧାଡ଼ିରେ ଗୋଟିଏ ବାକ୍ୟ ଲେଖନ୍ତୁ (ସର୍ବାଧିକ 20)"
  },
  as: {
    feeling: "আজি আপুনি কেনে অনুভৱ কৰিছে?",
    placeholder: "প্ৰতি শাৰীত এটা বাক্য লিখক (সৰ্বাধিক ২০)"
  }
};

export default function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uiLang = language === "auto" ? "en" : language;
  const t = UI_TEXT[uiLang] || UI_TEXT.en;

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
        <h1>Sentiment Insight Analyzer</h1>
        <p>Multilingual sentiment analysis with structured, actionable guidance.</p>

        {/* INPUT */}
        <section style={{ marginTop: "24px", border: "1.5px solid #bfdbfe", borderRadius: "12px", padding: "24px" }}>
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
        {aggregate && (
          <>
            <SentimentCircle severity={aggregate.severity} />

            <section style={{ marginTop: "24px", border: "1.5px solid #bfdbfe", borderRadius: "12px", padding: "24px" }}>
              <h3>Analysis Results</h3>

              <p><b>Text:</b> {aggregate.text}</p>
              <p><b>Sentiment:</b> {aggregate.sentiment}</p>
              <p><b>Severity:</b> {aggregate.severity}</p>
              <p><b>Confidence:</b> {aggregate.confidence}</p>

              <WorkflowSteps steps={aggregate.roadmap} />
              <WorkflowVisualizer steps={aggregate.roadmap} />
            </section>

            <YouTubeRecs videos={aggregate.youtube_recommendations} />
          </>
        )}

        <p style={{ marginTop: "24px", fontSize: "12px", color: "#475569" }}>
          This system provides non-clinical, informational guidance only.
        </p>
      </div>
    </div>
  );
}
