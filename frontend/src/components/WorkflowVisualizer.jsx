// src/components/WorkflowVisualizer.jsx
import { COLORS } from "../colors";

export default function WorkflowVisualizer({ roadmap, severity }) {
  const level = severity.toLowerCase();
  const color = COLORS[level];

  return (
    <div style={{ marginTop: "24px" }}>
      <h3>Recommended Workflow</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {roadmap.map((step, idx) => {
          const stepColor =
            step.level === "critical"
              ? COLORS.high
              : step.level === "supportive"
              ? COLORS.mild
              : COLORS.low;

          return (
            <div
              key={idx}
              style={{
                padding: "14px",
                borderLeft: `6px solid ${stepColor.border}`,
                background: stepColor.bg,
                fontWeight:
                  step.level === "critical" ? "700" : "500",
                textTransform:
                  step.level === "critical" ? "uppercase" : "none"
              }}
            >
              {step.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
