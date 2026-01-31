import React from "react";

/**
 * Zig-zag workflow:
 * Row 1 → (2 steps)
 * Row 2 ↓ (1 step)
 * Row 3 → (remaining)
 */
export default function WorkflowVisualizer({ steps = [] }) {
  if (!steps.length) return null;

  const box = level => ({
    border:
      level === "critical"
        ? "2px solid #b45309"
        : level === "supportive"
        ? "2px solid #0369a1"
        : "2px solid #c7d2fe",
    background:
      level === "critical"
        ? "#fffbeb"
        : level === "supportive"
        ? "#f0f9ff"
        : "#f8fafc",
    padding: "18px 22px",
    borderRadius: "10px",
    fontSize: "1.125rem",
    lineHeight: "1.45",
    maxWidth: "260px",
    textAlign: "center"
  });

  return (
    <div className="app-workflow-visualizer" style={{ marginTop: "24px" }}>

      {/* ROW 1 */}
      <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
        {steps.slice(0, 2).map((s, i) => (
          <div key={i} style={box(s.level)}>{s.text}</div>
        ))}
      </div>

      {/* CENTER */}
      {steps[2] && (
        <>
          <div style={{ textAlign: "center", margin: "14px 0" }}>↓</div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={box(steps[2].level)}>{steps[2].text}</div>
          </div>
        </>
      )}

      {/* ROW 3 */}
      {steps.length > 3 && (
        <>
          <div style={{ textAlign: "center", margin: "14px 0" }}>↓</div>
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            {steps.slice(3).map((s, i) => (
              <div key={i} style={box(s.level)}>{s.text}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
