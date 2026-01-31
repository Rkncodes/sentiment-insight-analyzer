export default function Resources() {
  return (
    <div className="info-page">
      <h1 className="info-title">Resources</h1>

      <p className="info-intro">
        If you are experiencing emotional distress or feel overwhelmed, seeking
        professional help or trusted support resources can be an important step.
      </p>

      <div className="info-section">
        <h3>When to seek professional help</h3>
        <p>
          If feelings such as sadness, anxiety, fear, or hopelessness persist
          over time, interfere with daily functioning, or feel unmanageable,
          consider reaching out to a qualified mental health professional.
        </p>
      </div>

      <div className="info-section">
        <h3>Trusted mental health resources</h3>
        <p>
          Below are internationally recognized organizations that provide
          reliable information and support:
        </p>
        <ul style={{ marginTop: "8px", paddingLeft: "18px", color: "#475569" }}>
          <li>
            World Health Organization (WHO) – Mental Health
          </li>
          <li>
            National government health portals and helplines
          </li>
          <li>
            Licensed psychologists, psychiatrists, and counselors
          </li>
        </ul>
      </div>

      <div className="info-disclaimer">
        <strong>Note:</strong> This page provides informational references only
        and does not replace professional medical or mental health care.
      </div>
    </div>
  );
}
