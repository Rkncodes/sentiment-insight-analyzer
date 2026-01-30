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

/* ---------- UI TEXT PER LANGUAGE ---------- */
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
    placeholder: "প্রতি লাইনে একটি বাক্য (সর্বোচ্চ ২০)"
  },
  mr: {
    feeling: "आज तुम्ही कसे वाटत आहात?",
    placeholder: "प्रत्येक ओळीत एक वाक्य (कमाल 20)"
  },
  gu: {
    feeling: "આજે તમે કેવી રીતે અનુભવો છો?",
    placeholder: "દર લાઇનમાં એક વાક્ય (મહત્તમ 20)"
  },
  pa: {
    feeling: "ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?",
    placeholder: "ਹਰ ਲਾਈਨ ਵਿੱਚ ਇੱਕ ਵਾਕ (ਅਧਿਕਤਮ 20)"
  },
  ta: {
    feeling: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    placeholder: "ஒரு வரியில் ஒரு வாக்கியம் (அதிகபட்சம் 20)"
  },
  te: {
    feeling: "ఈ రోజు మీరు ఎలా అనుభవిస్తున్నారు?",
    placeholder: "ప్రతి వరుసలో ఒక వాక్యం (గరిష్టంగా 20)"
  },
  kn: {
    feeling: "ಇಂದು ನೀವು ಹೇಗಿದ್ದೀರಿ?",
    placeholder: "ಪ್ರತಿ ಸಾಲಿಗೆ ಒಂದು ವಾಕ್ಯ (ಗರಿಷ್ಠ 20)"
  },
  or: {
    feeling: "ଆଜି ଆପଣ କେମିତି ଅନୁଭବ କରୁଛନ୍ତି?",
    placeholder: "ପ୍ରତ୍ୟେକ ଧାଡ଼ିରେ ଗୋଟିଏ ବାକ୍ୟ (ସର୍ବାଧିକ 20)"
  },
  as: {
    feeling: "আজি আপুনি কেনে অনুভৱ কৰিছে?",
    placeholder: "প্ৰতি শাৰীত এটা বাক্য (সৰ্বাধিক ২০)"
  }
};

/* ---------- APP ---------- */
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
        {/* TITLE */}
        <h1 style={{ fontSize: "30px", color: "#0f172a", marginBottom: "8px" }}>
          Sentiment Insight Analyzer
        </h1>
        <p style={{ color: "#334155", fontSize: "15px" }}>
          Multilingual sentiment analysis with structured, actionable guidance.
        </p>

        {/* INPUT */}
        <section
          style={{
            marginTop: "30px",
            border: "1.5px solid #bfdbfe",
            borderRadius: "12px",
            padding: "24px"
          }}
        >
          <h3 style={{ marginBottom: "12px" }}>Input Statements</h3>

          <label style={{ fontSize: "14px", fontWeight: 600 }}>
            {t.feeling}
          </label>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #c7d2fe"
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
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
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>

          {error && (
            <p style={{ marginTop: "10px", color: "#b91c1c" }}>{error}</p>
          )}
        </section>

        {/* RESULTS */}
        {results.length > 0 && (
          <section
            style={{
              marginTop: "30px",
              border: "1.5px solid #bfdbfe",
              borderRadius: "12px",
              padding: "24px"
            }}
          >
            <h3>Analysis Results</h3>

            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "10px"
                }}
              >
                <p><b>Text:</b> {r.text}</p>
                <p><b>Sentiment:</b> {r.sentiment}</p>
                <p><b>Severity:</b> {r.severity}</p>
                <p><b>Confidence:</b> {r.confidence}</p>

                <p style={{ marginTop: "10px", fontWeight: 600 }}>
                  Recommended Workflow:
                </p>

                <ul>
                  {r.roadmap.map((step, idx) => (
                    <li
                      key={idx}
                      style={{
                        color:
                          step.level === "critical"
                            ? "#991b1b"
                            : step.level === "supportive"
                            ? "#92400e"
                            : "#0f172a",
                        fontWeight:
                          step.level === "critical" ? "700" : "400"
                      }}
                    >
                      {step.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* SESSION SUMMARY */}
        {results.length > 0 && (
          <section
            style={{
              marginTop: "30px",
              padding: "16px",
              background: "#f1f5f9",
              borderRadius: "10px"
            }}
          >
            <b>Session Summary</b>
            <p>Total statements analyzed: {results.length}</p>
          </section>
        )}

        {/* YT PLACEHOLDER */}
        <section
          style={{
            marginTop: "30px",
            padding: "16px",
            border: "1px dashed #c7d2fe",
            borderRadius: "10px"
          }}
        >
          <b>Recommended Videos (Coming Soon)</b>
          <p style={{ fontSize: "13px", color: "#475569" }}>
            Video recommendations will be generated based on sentiment severity.
          </p>
        </section>

        {/* DISCLAIMER */}
        <p style={{ marginTop: "24px", fontSize: "12px", color: "#475569" }}>
          This system provides non-clinical, informational guidance only.
        </p>
      </div>
    </div>
  );
}
