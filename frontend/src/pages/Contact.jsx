export default function Contact() {
  return (
    <div className="app-results-section">
      <h2 className="app-results-title">Contact</h2>

      <p style={{ marginBottom: "12px", color: "#334155" }}>
        This project was built by a student as a hands-on exploration of machine
        learning, natural language processing, and sentiment analysis.
        If you have feedback, suggestions, or are interested in collaborating
        or contributing ideas, feel free to reach out.
      </p>

      <p style={{ marginBottom: "8px" }}>
        <strong>Email:</strong>{" "}
        <a href="mailto:rajvinderkaurpersonal@email.com">
          rajvinderkaurpersonal@email.com
        </a>
      </p>

      <p style={{ marginBottom: "16px" }}>
        <strong>GitHub:</strong>{" "}
        <a
          href="https://github.com/Rkncodes"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/Rkncodes
        </a>
      </p>

      <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
        <strong>Disclaimer:</strong> This tool does not replace professional
        medical or mental health advice. If you are experiencing severe emotional
        distress, please contact a qualified mental health professional or local
        emergency services.
      </p>
    </div>
  );
}
