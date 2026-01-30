export function resolveLanguage(selectedLang, detectedLang) {
  if (selectedLang === "auto") return detectedLang || "en";
  return selectedLang;
}

export function normalizeSentiment(label) {
  if (!label) return "neutral";

  if (label.includes("Positive")) return "positive";
  if (label.includes("Low mood")) return "low";
  if (label.includes("High emotional")) return "distress";

  return "neutral";
}
