import React from "react";

export default function WorkflowVisualizer({ steps = [] }) {
  if (!steps.length) return null;

  const box = {
    border: "1.5px solid #c7d2fe",
    padding: "10px",
    borderRadius: "8px",
    background: "#f8fafc",
    fontSize: "13px",
    maxWidth: "180px",
    textAlign: "center"
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <h4>Guided Workflow</h4>

      {/* ROW 1 */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        {steps.slice(0, 2).map((s, i) => (
          <div key={i} style={box}>{s.text}</div>
        ))}
      </div>

      {/* ARROW DOWN */}
      {steps[2] && (
        <div style={{ textAlign: "center", margin: "8px 0" }}>↓</div>
      )}

      {/* CENTER */}
      {steps[2] && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={box}>{steps[2].text}</div>
        </div>
      )}

      {/* ROW 2 */}
      {steps.length > 3 && (
        <>
          <div style={{ textAlign: "center", margin: "8px 0" }}>↓</div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            {steps.slice(3).map((s, i) => (
              <div key={i} style={box}>{s.text}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
