export default function About() {
  return (
    <div className="info-page">
      <h1 className="info-title">About</h1>

      <p className="info-intro">
        Sentiment Insight Analyzer is a student-built project created as a
        hands-on exploration of machine learning, natural language processing,
        and sentiment analysis through a practical, end-to-end application.
      </p>

      <div className="info-section">
        <h3>What this system does</h3>
        <p>
          The system analyzes user-provided text to identify emotional tone and
          sentiment patterns, and presents structured, non-clinical guidance to
          help users reflect on their mental and emotional state.
        </p>
      </div>

      <div className="info-section">
        <h3>Why this project exists</h3>
        <p>
          This project was built for learning and research purposes, with the
          goal of understanding how modern NLP models can be applied responsibly
          in real-world user-facing applications.
        </p>
      </div>

      <div className="info-disclaimer">
        <strong>Disclaimer:</strong> This project is intended for educational
        and research use only. It does not provide medical, psychological, or
        clinical diagnoses.
      </div>
    </div>
  );
}
