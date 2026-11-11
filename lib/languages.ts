// GitHub's linguist colors for the languages likely to show up on repo cards.
const COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Dart: "#00b4ab",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Go: "#00add8",
  Rust: "#dea584",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  PHP: "#4f5d95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  "Jupyter Notebook": "#da5b0b",
};

export function languageColor(lang?: string): string {
  return (lang && COLORS[lang]) || "#85868d";
}
