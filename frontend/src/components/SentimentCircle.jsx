import React from "react";
import { COLORS } from "../colors";

export default function SentimentCircle({ severity }) {
  const color =
    severity === "High"
      ? COLORS.red
      : severity === "Mild"
      ? COLORS.yellow
      : COLORS.green;

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke={color}
          strokeWidth="10"
          fill="none"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="16"
          fontWeight="600"
          fill={color}
        >
          {severity}
        </text>
      </svg>
    </div>
  );
}
