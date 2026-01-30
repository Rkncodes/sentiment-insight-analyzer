import React from "react";
import { COLORS } from "../colors";

export default function WorkflowSteps({ steps }) {
  return (
    <div>
      {steps.map((step, idx) => {
        const color =
          step.level === "critical"
            ? COLORS.red
            : step.level === "supportive"
            ? COLORS.orange
            : COLORS.green;

        return (
          <div
            key={idx}
            style={{
              borderLeft: `4px solid ${color}`,
              padding: "10px 12px",
              marginBottom: "8px",
              background: COLORS.lightBackground,
              fontWeight: step.level === "critical" ? "700" : "500",
              textTransform: step.level === "critical" ? "uppercase" : "none"
            }}
          >
            {step.text}
          </div>
        );
      })}
    </div>
  );
}
