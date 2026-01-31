export default function Contact() {
  return (
    <div className="info-page">
      <h1 className="info-title">Contact</h1>

      <p className="info-intro">
        This project was built by a student as a hands-on exploration of machine
        learning, natural language processing, and sentiment analysis.
      </p>

      <div className="info-section">
        <p>
          If you have feedback, suggestions, or are interested in collaborating
          or contributing ideas, feel free to reach out.
        </p>
      </div>

      <div className="info-section">
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:rajvinderkaurpersonal@email.com">
            rajvinderkaurpersonal@email.com
          </a>
        </p>

        <p style={{ marginTop: "8px" }}>
          <strong>GitHub:</strong>{" "}
          <a
            href="https://github.com/Rkncodes"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/Rkncodes
          </a>
        </p>
      </div>

      <div className="info-disclaimer">
        <strong>Disclaimer:</strong> This tool does not replace professional
        medical or mental health advice. If you are experiencing severe emotional
        distress, please contact a qualified mental health professional or local
        emergency services.
      </div>
    </div>
  );
}
