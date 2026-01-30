export function normalizeSeverity(sentiment, confidence) {
  if (sentiment === "High emotional distress" && confidence >= 0.75) {
    return "High";
  }
  if (sentiment === "Low mood or fatigue") {
    return "Mild";
  }
  return "Low";
}
