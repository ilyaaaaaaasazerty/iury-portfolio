// Deterministic, per-project "film plate" configuration so image-less projects
// each render a distinct designed placeholder instead of an identical aperture.

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type PlateVariant = "rings" | "sprockets" | "waveform" | "scan" | "specsheet";

export interface PlateConfig {
  blades: number;
  swirl: number;
  grid: number;
  rotate: number;
  variant: PlateVariant;
  ringCount: number;
  bars: number[];
}

const VARIANTS: PlateVariant[] = ["rings", "sprockets", "waveform", "scan", "specsheet"];

export function plateConfig(id: string, category = ""): PlateConfig {
  const h = hashStr(id);
  const cat = category.toLowerCase();

  // category hints nudge the variant so it feels intentional
  let variant: PlateVariant = VARIANTS[(h >> 4) % VARIANTS.length];
  if (cat.includes("ai") || cat.includes("voice")) variant = "waveform";
  else if (cat.includes("webgl") || cat.includes("vision")) variant = "rings";
  else if (cat.includes("infrastructure") || cat.includes("realtime")) variant = "scan";
  else if (cat.includes("desktop") || cat.includes("business")) variant = "specsheet";

  const blades = 9 + (h % 7); // 9..15
  const swirl = 22 + ((h >> 3) % 16); // 22..37
  const grid = [30, 38, 44, 52][(h >> 6) % 4];
  const rotate = (h >> 9) % 360;
  const ringCount = 3 + ((h >> 11) % 4); // 3..6

  const bars: number[] = [];
  let seed = h;
  for (let i = 0; i < 28; i++) {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    bars.push(0.18 + (seed % 1000) / 1000 * 0.82);
  }

  return { blades, swirl, grid, rotate, variant, ringCount, bars };
}
