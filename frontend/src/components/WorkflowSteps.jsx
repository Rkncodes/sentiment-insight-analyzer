import React from "react";

const SEVERITY_BORDER = {
  mild: "#fcd34d",
  moderate: "#fdba74",
  high: "#fca5a5"
};

const FALLBACK_BORDER = {
  critical: "#fca5a5",
  supportive: "#fdba74",
  default: "#94a3b8"
};

const LIGHT_BG = "#f8fafc";

function getBorderColor(severity, step) {
  if (severity) {
    const key = String(severity).toLowerCase().replace(/\s+/g, "-");
    if (SEVERITY_BORDER[key]) return SEVERITY_BORDER[key];
  }
  return step.level === "critical"
    ? FALLBACK_BORDER.critical
    : step.level === "supportive"
    ? FALLBACK_BORDER.supportive
    : FALLBACK_BORDER.default;
}

export default function WorkflowSteps({ steps, severity }) {
  return (
    <div className="app-workflow-steps">
      {steps.map((step, idx) => {
        const borderColor = getBorderColor(severity, step);

        return (
          <div
            key={idx}
            className="app-workflow-step"
            style={{
              borderLeft: `4px solid ${borderColor}`,
              padding: "14px 16px",
              marginBottom: "18px",
              background: LIGHT_BG,
              fontWeight: step.level === "critical" ? "700" : "500",
              textTransform: step.level === "critical" ? "uppercase" : "none",
              fontSize: "1.0625rem",
              lineHeight: "1.5"
            }}
          >
            {step.text}
          </div>
        );
      })}
    </div>
  );
}
