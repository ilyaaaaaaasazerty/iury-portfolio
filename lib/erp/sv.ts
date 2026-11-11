import type { CSSProperties } from "react";

/**
 * Scroll-variable CSS helpers.
 *
 * Every pinned <Scene> writes its progress into CSS custom properties on its
 * sticky stage — no React re-render per frame:
 *   --p        overall scene progress, 0 → 1
 *   --b0..--bN progress *within* beat i, 0 → 1 (0 before it, 1 after it)
 * Non-pinned <Track> elements write --t the same way.
 *
 * These helpers build the CSS expressions, e.g.
 *   style={{ opacity: seg("--b1", 0, 0.3),
 *            transform: `translateY(${lerp(seg("--b1", 0, 0.3), 24, 0, "px")})` }}
 */

/** Local 0→1 progress of `name` between a and b (clamped). */
export function seg(name: string, a = 0, b = 1): string {
  const span = Math.max(0.0001, b - a);
  return `clamp(0, calc((var(${name}, 0) - ${a}) / ${span}), 1)`;
}

/** Interpolate from → to (with unit) along a 0→1 expression. */
export function lerp(t: string, from: number, to: number, unit = ""): string {
  return `calc(${from}${unit} + ${t} * ${to - from}${unit})`;
}

/** 1 while inside [a, b] of `name`, fading in over `fin` and out over `fout`. */
export function win(name: string, a: number, b: number, fin = 0.12, fout = 0.12): string {
  const inn = seg(name, a, a + fin);
  const out = fout > 0 && b < 1 ? `calc(1 - ${seg(name, b - fout, b)})` : "1";
  return `min(${inn}, ${out})`;
}

/** 1 - t */
export function inv(t: string): string {
  return `calc(1 - ${t})`;
}

/** Shorthand: fade + rise as `name` goes a → b. */
export function rise(name: string, a = 0, b = 0.3, px = 24): CSSProperties {
  const t = seg(name, a, b);
  return { opacity: t, transform: `translate3d(0, ${lerp(t, px, 0, "px")}, 0)` };
}

/** Draw an SVG stroke whose length is `len` as `name` goes a → b. Pair with strokeDasharray={len}. */
export function draw(name: string, a: number, b: number, len: number): CSSProperties {
  return { strokeDasharray: `${len}px`, strokeDashoffset: `calc(${len}px * ${inv(seg(name, a, b))})` };
}

/** Pure-JS equivalent of seg(), for code driven by useSceneProgress(). */
export function local(p: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (p - a) / Math.max(0.0001, b - a)));
}

/** Progress inside beat i of n, from overall scene progress p. */
export function beatLocal(p: number, i: number, n: number): number {
  return Math.min(1, Math.max(0, p * n - i));
}
