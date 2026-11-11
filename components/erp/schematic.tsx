"use client";

/**
 * The ERP schematic: eighteen modules in four bands, data flows routed in
 * the gutters like a wiring diagram, the platform core as a bus underneath.
 * Draw-in and band labels can be bound to a scene's CSS variables.
 */

import type { CSSProperties } from "react";
import { BANDS, NODES, type BandId, type NodeId } from "@/lib/erp/nodes";
import { useTx } from "@/lib/erp/i18n";
import { seg, lerp } from "@/lib/erp/sv";

const W = 1200;
/** Drawing is cropped to its content (band labels at the top, core row at the bottom). */
const VB_Y = 24;
const H = 620;
const NW = 204;
const NH = 56;
const COLS = [140, 370, 600, 830, 1060];
const ROW_Y: Record<BandId, number> = { reach: 80, ops: 240, finance: 400, core: 600 };
const BUS_Y = 506;

const POS: Record<NodeId, { x: number; y: number }> = (() => {
  const out = {} as Record<NodeId, { x: number; y: number }>;
  const byBand: Record<BandId, NodeId[]> = { reach: [], ops: [], finance: [], core: [] };
  NODES.forEach((n) => byBand[n.band].push(n.id));
  (Object.keys(byBand) as BandId[]).forEach((b) => {
    const ids = byBand[b];
    const cols = ids.length === 3 ? [COLS[1], COLS[2], COLS[3]] : COLS;
    ids.forEach((id, i) => (out[id] = { x: cols[i], y: ROW_Y[b] }));
  });
  return out;
})();

type Pt = [number, number];
interface Edge {
  from: NodeId;
  to: NodeId;
  pts: Pt[];
}

const top = (id: NodeId): Pt => [POS[id].x, POS[id].y - NH / 2];
const bot = (id: NodeId, dx = 0): Pt => [POS[id].x + dx, POS[id].y + NH / 2];
const left = (id: NodeId): Pt => [POS[id].x - NW / 2, POS[id].y];
const right = (id: NodeId): Pt => [POS[id].x + NW / 2, POS[id].y];

/** Hand-routed so no wire crosses a module box. */
const EDGES: Edge[] = [
  { from: "crm", to: "contracts", pts: [bot("crm"), [370, 160], [255, 160], [255, 320], [140, 320], top("contracts")] },
  { from: "portal", to: "orders", pts: [bot("portal"), top("orders")] },
  { from: "comms", to: "portal", pts: [left("comms"), right("portal")] },
  { from: "procurement", to: "inventory", pts: [right("procurement"), left("inventory")] },
  { from: "orders", to: "inventory", pts: [left("orders"), right("inventory")] },
  { from: "maintenance", to: "field", pts: [left("maintenance"), right("field")] },
  { from: "field", to: "payroll", pts: [bot("field"), [830, 320], [1060, 320], top("payroll")] },
  { from: "inventory", to: "ledger", pts: [bot("inventory"), [370, 320], [600, 320], top("ledger")] },
  { from: "contracts", to: "arap", pts: [right("contracts"), left("arap")] },
  { from: "arap", to: "ledger", pts: [right("arap"), left("ledger")] },
  { from: "ledger", to: "tax", pts: [right("ledger"), left("tax")] },
  { from: "payroll", to: "ledger", pts: [bot("payroll"), [1060, 466], [624, 466], bot("ledger", 24)] },
];

function len(pts: Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
  return Math.max(1, Math.round(l));
}
/** Largest font size (up to `max`) at which a label still fits inside a module box. */
const fit = (label: string, max: number) => Math.max(12, Math.min(max, (NW - 26) / (label.length * 0.53)));

const d = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

/** Bus stubs: every finance module drops onto the bus, every core module rises to it. */
const STUBS: Pt[][] = [
  ...(["contracts", "arap", "tax"] as NodeId[]).map((id) => [bot(id), [POS[id].x, BUS_Y]] as Pt[]),
  [bot("ledger", -24), [576, BUS_Y]],
  [bot("payroll", -40), [1020, BUS_Y]],
  ...NODES.filter((n) => n.band === "core").map((n) => [top(n.id), [POS[n.id].x, BUS_Y]] as Pt[]),
];
const TRUNK: Pt[] = [[22, BUS_Y], [22, 80]];
const TRUNK_TICKS: Pt[][] = [
  [[22, 80], [32, 80]],
  [[22, 240], [32, 240]],
  [[22, 400], [32, 400]],
];

export default function Schematic({
  lit,
  draw,
  labels,
  flowing = false,
  highlight,
  className = "",
  style,
  compact = false,
}: {
  lit: ReadonlySet<NodeId>;
  /** CSS var (e.g. "--b1") driving the draw-in 0 → 1. Omit = fully drawn. */
  draw?: string;
  /** CSS var driving band labels 0 → 1. Omit = visible. */
  labels?: string;
  /** Animate data flowing along every wire whose ends are both lit. */
  flowing?: boolean;
  /** Modules to emphasise (others dim). */
  highlight?: NodeId[];
  className?: string;
  style?: CSSProperties;
  compact?: boolean;
}) {
  const tx = useTx();
  const ink = "var(--color-ink)";
  const hair = "var(--erp-hair-2)";
  const sig = "var(--color-signal)";

  const t = (a: number, b: number): string | number => (draw ? seg(draw, a, b) : 1);
  const dash = (L: number, a: number, b: number): CSSProperties =>
    draw ? { strokeDasharray: `${L}px`, strokeDashoffset: `calc(${L}px * (1 - ${seg(draw, a, b)}))` } : {};

  return (
    <svg
      viewBox={`0 ${VB_Y} ${W} ${H}`}
      className={className}
      style={style}
      role="img"
      aria-label={tx({ en: "ERP module map", fr: "Carte des modules ERP", ar: "خريطة وحدات النظام" })}
      direction="ltr"
    >
      {/* trunk + bus: the platform core serves every band */}
      <g fill="none" stroke={hair} strokeWidth={1}>
        <path d={d(TRUNK)} style={dash(len(TRUNK), 0.05, 0.4)} />
        {TRUNK_TICKS.map((p, i) => (
          <path key={i} d={d(p)} strokeDasharray="2 4" style={{ opacity: t(0.3, 0.5) }} />
        ))}
        <path d={`M22 ${BUS_Y} H1178`} stroke={ink} strokeWidth={1.5} style={dash(1156, 0.1, 0.5)} />
        {STUBS.map((p, i) => (
          <path key={i} d={d(p)} style={dash(len(p), 0.35 + (i % 5) * 0.03, 0.6 + (i % 5) * 0.03)} />
        ))}
      </g>

      {/* data flows */}
      <g fill="none">
        {EDGES.map((e, i) => {
          const L = len(e.pts);
          const on = lit.has(e.from) && lit.has(e.to);
          return (
            <g key={i}>
              <path
                d={d(e.pts)}
                stroke={on ? sig : ink}
                strokeOpacity={on ? 0.9 : 0.6}
                strokeWidth={on ? 1.75 : 1.25}
                style={dash(L, 0.25 + i * 0.03, 0.6 + i * 0.03)}
              />
              {flowing && on && (
                <path d={d(e.pts)} stroke={sig} strokeWidth={2.5} strokeDasharray="4 10" className="erp-flow" />
              )}
              {/* arrowhead */}
              <circle
                cx={e.pts[e.pts.length - 1][0]}
                cy={e.pts[e.pts.length - 1][1]}
                r={2.6}
                fill={on ? sig : ink}
                style={{ opacity: t(0.6 + i * 0.02, 0.75 + i * 0.02) }}
              />
            </g>
          );
        })}
      </g>

      {/* band labels */}
      <g style={{ opacity: labels ? seg(labels, 0, 0.5) : 1 }}>
        {BANDS.map((b) => {
          const y = ROW_Y[b.id] - NH / 2 - 12;
          return (
            <text
              key={b.id}
              x={45}
              y={y}
              className="erp-mono"
              fontSize={compact ? 14 : 13}
              letterSpacing={/[؀-ۿ]/.test(tx(b.label)) ? 0 : 2 /* spacing breaks Arabic joining */}
              fill="var(--color-faint)"
              stroke="var(--color-paper)"
              strokeWidth={5}
              strokeLinejoin="round"
              style={{ paintOrder: "stroke" }}
            >
              {b.code} — {tx(b.label).toUpperCase()}
            </text>
          );
        })}
      </g>

      {/* modules */}
      <g>
        {NODES.map((n, i) => {
          const p = POS[n.id];
          const on = lit.has(n.id);
          const dim = highlight && !highlight.includes(n.id);
          const appear = draw ? seg(draw, 0.02 + i * 0.022, 0.2 + i * 0.022) : 1;
          return (
            <g
              key={n.id}
              transform={`translate(${p.x - NW / 2} ${p.y - NH / 2})`}
              style={{
                opacity: dim ? 0.35 : appear,
                transition: "opacity .5s",
              }}
            >
              <g style={draw ? { transform: `translateY(${lerp(seg(draw, 0.02 + i * 0.022, 0.2 + i * 0.022), 8, 0, "px")})` } : undefined}>
                <rect
                  width={NW}
                  height={NH}
                  fill={on ? "color-mix(in srgb, var(--color-signal) 10%, var(--color-paper))" : "var(--color-paper)"}
                  stroke={on ? sig : ink}
                  strokeOpacity={on ? 1 : 0.75}
                  strokeWidth={on ? 2 : 1.25}
                  style={{ transition: "fill .6s, stroke .6s" }}
                />
                <rect x={NW - 14} y={8} width={6} height={6} fill={on ? sig : "var(--color-steel)"} style={{ transition: "fill .6s" }} />
                <text x={12} y={20} className="erp-mono" fontSize={compact ? 13 : 12} letterSpacing={1.5} fill={on ? sig : "var(--color-faint)"}>
                  {n.code}
                </text>
                <text x={12} y={42} fontSize={fit(tx(n.label), compact ? 17.5 : 16)} fontWeight={500} fill={ink} style={{ fontFamily: "var(--font-hanken), sans-serif" }}>
                  {tx(n.label)}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
