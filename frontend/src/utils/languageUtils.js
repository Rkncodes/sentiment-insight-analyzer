export function resolveLanguage(selectedLang, detectedLang) {
  if (selectedLang === "auto") return detectedLang || "en";
  return selectedLang;
}
