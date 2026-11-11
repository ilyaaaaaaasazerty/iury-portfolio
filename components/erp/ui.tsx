"use client";

/**
 * Shared building blocks for every chapter. Chapters compose these with their
 * own bespoke figures (SVG / HTML mockups) built on the engine in ./engine.
 */

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useTx, type Tx, type L } from "@/lib/erp/i18n";
import { NODE_BY_ID, type NodeId } from "@/lib/erp/nodes";
import { CountUp, Reveal, Track, useLitNodes } from "./engine";

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export function Kicker({ children, className = "", lit = false }: { children: ReactNode; className?: string; lit?: boolean }) {
  return (
    <p className={`erp-kicker flex items-center gap-2 ${className}`}>
      <span className={`erp-dot ${lit ? "" : ""}`} data-lit={lit ? "" : undefined} />
      <span>{children}</span>
    </p>
  );
}

export function Title({
  children,
  as: Tag = "h3",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  size?: "xl" | "lg" | "md" | "sm";
  className?: string;
}) {
  const sizes = {
    xl: "text-[clamp(2.6rem,7vw,6.4rem)]",
    lg: "text-[clamp(2.1rem,4.6vw,4.2rem)]",
    md: "text-[clamp(1.7rem,3vw,2.75rem)]",
    sm: "text-[clamp(1.3rem,2vw,1.75rem)]",
  } as const;
  return <Tag className={`erp-display text-ink ${sizes[size]} ${className}`}>{children}</Tag>;
}

export function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`erp-body ${className}`}>{children}</p>;
}

/** A spec sheet: label / value rows separated by hairlines. */
export function Spec({
  rows,
  className = "",
}: {
  rows: { k: Tx; v: Tx | ReactNode }[];
  className?: string;
}) {
  const tx = useTx();
  return (
    <dl className={`divide-y divide-[var(--erp-hair)] border-y border-[var(--erp-hair)] ${className}`}>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[minmax(7rem,38%)_1fr] gap-4 py-2.5 text-[0.9rem] leading-snug">
          <dt className="erp-kicker !text-[0.66rem] pt-0.5">{tx(r.k)}</dt>
          <dd className="text-graphite">
            {typeof r.v === "string" || (r.v && typeof r.v === "object" && "en" in (r.v as object))
              ? tx(r.v as Tx)
              : (r.v as ReactNode)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Bulleted detail lines with a hairline marker. */
export function Details({ items, className = "" }: { items: Tx[]; className?: string }) {
  const tx = useTx();
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[0.95rem] leading-snug text-graphite">
          <span className="erp-mono mt-[0.2rem] shrink-0 text-[0.68rem] text-faint">{String(i + 1).padStart(2, "0")}</span>
          <span>{tx(it)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Inline monospace token (state names, numbers, formats). */
export function Code({ children, lit = false, className = "" }: { children: ReactNode; lit?: boolean; className?: string }) {
  return (
    <code
      className={`erp-mono rounded-[2px] px-1.5 py-0.5 text-[0.82em] ${
        lit ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "bg-shell/70 text-graphite"
      } ${className}`}
    >
      {children}
    </code>
  );
}

/* ------------------------------------------------------------------ */
/* Frames                                                              */
/* ------------------------------------------------------------------ */

/** Technical-drawing frame: hairline border, corner ticks, figure label. */
export function Figure({
  fig,
  title,
  children,
  className = "",
  bodyClassName = "",
  dark = false,
  footer,
  style,
}: {
  fig?: string;
  title?: Tx;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  dark?: boolean;
  footer?: ReactNode;
  style?: CSSProperties;
}) {
  const tx = useTx();
  return (
    <figure className={`erp-frame ${dark ? "erp-frame-dark erp-steel" : ""} ${className}`} style={style} dir="ltr">
      <span className="erp-tick tl" />
      <span className="erp-tick tr" />
      <span className="erp-tick bl" />
      <span className="erp-tick br" />
      {(fig || title) && (
        <figcaption
          className={`flex items-center justify-between gap-4 border-b px-3.5 py-2 ${
            dark ? "border-white/10 text-white/55" : "border-[var(--erp-hair)] text-faint"
          }`}
        >
          <span className="erp-mono shrink-0 whitespace-nowrap text-[0.64rem] uppercase tracking-[0.16em]">{fig}</span>
          {title && <span className="erp-mono min-w-0 truncate text-[0.64rem] uppercase tracking-[0.12em]">{tx(title)}</span>}
        </figcaption>
      )}
      <div className={`relative ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className={`border-t px-3.5 py-2 ${dark ? "border-white/10" : "border-[var(--erp-hair)]"}`}>{footer}</div>
      )}
    </figure>
  );
}

/** A screenshot inside a frame, with optional numbered callout pins (x/y in %). */
export function Screen({
  src,
  alt,
  width,
  height,
  fig,
  title,
  pins = [],
  activePins,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  fig?: string;
  title?: Tx;
  pins?: { x: number; y: number; label: Tx }[];
  /** Which pins are visible; defaults to all. */
  activePins?: number[];
  className?: string;
  priority?: boolean;
}) {
  const tx = useTx();
  return (
    <Figure fig={fig} title={title} className={className}>
      <div className="relative">
        <Image src={src} alt={alt} width={width} height={height} priority={priority} className="block h-auto w-full" />
        {pins.map((p, i) => {
          const on = !activePins || activePins.includes(i);
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: on ? 1 : 0, transform: `translate(-50%,-50%) scale(${on ? 1 : 0.6})` }}
            >
              <span className="relative flex h-6 w-6 items-center justify-center bg-signal text-[0.68rem] font-semibold text-white shadow-[0_0_0_4px_var(--erp-signal-soft)]">
                <span className="erp-mono">{i + 1}</span>
              </span>
              <span className="absolute start-8 top-1/2 hidden w-max max-w-[16rem] -translate-y-1/2 bg-ink px-2.5 py-1.5 text-[0.72rem] leading-snug text-white md:block">
                {tx(p.label)}
              </span>
            </div>
          );
        })}
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* State track — a state machine drawn as a line of stations           */
/* ------------------------------------------------------------------ */

export function StateTrack({
  states,
  active,
  branches = [],
  className = "",
  dark = false,
}: {
  states: string[];
  /** Index of the current state; states before it are "done". */
  active: number;
  /** Side exits drawn under the line, e.g. ["cancelled", "refunded"]. */
  branches?: string[];
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={`w-full ${className}`} dir="ltr">
      <div className="relative flex items-start justify-between">
        <span
          className={`absolute left-0 right-0 top-[7px] h-px ${dark ? "bg-white/20" : "bg-[var(--erp-hair-2)]"}`}
        />
        <span
          className="absolute left-0 top-[7px] h-px bg-signal transition-[width] duration-700 ease-[var(--erp-ease)]"
          style={{ width: `${(Math.max(0, Math.min(active, states.length - 1)) / Math.max(1, states.length - 1)) * 100}%` }}
        />
        {states.map((s, i) => {
          const done = i < active;
          const cur = i === active;
          return (
            <div key={s} className="relative flex min-w-0 flex-1 flex-col items-center first:items-start last:items-end">
              <span
                className={`relative z-10 h-[15px] w-[15px] border transition-colors duration-500 ${
                  cur
                    ? "border-signal bg-signal shadow-[0_0_0_4px_var(--erp-signal-soft)]"
                    : done
                      ? "border-ink bg-ink"
                      : dark
                        ? "border-white/40 bg-[#1b1c20]"
                        : "border-[var(--erp-hair-2)] bg-paper"
                }`}
              />
              <span
                className={`erp-mono mt-2 max-w-full truncate text-[0.62rem] transition-colors duration-500 sm:text-[0.68rem] ${
                  cur ? "text-signal" : done ? (dark ? "text-white/80" : "text-ink") : dark ? "text-white/40" : "text-faint"
                }`}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>
      {branches.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {branches.map((b) => (
            <span key={b} className={`erp-mono border border-dashed px-2 py-0.5 text-[0.62rem] ${dark ? "border-white/25 text-white/50" : "border-[var(--erp-hair-2)] text-faint"}`}>
              ↳ {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter cover                                                       */
/* ------------------------------------------------------------------ */

export function NodeChips({ nodes, className = "" }: { nodes: NodeId[]; className?: string }) {
  const tx = useTx();
  const { lit } = useLitNodes();
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {nodes.map((id) => {
        const n = NODE_BY_ID[id];
        const on = lit.has(id);
        return (
          <span key={id} className="erp-chip">
            <span className="erp-dot" data-lit={on ? "" : undefined} />
            <span className="erp-mono text-[0.64rem] text-faint">{n.code}</span>
            <span className={on ? "text-ink" : ""}>{tx(n.label)}</span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * The opening spread of a chapter (not pinned): big number, chapter title,
 * product, one-liner, context, who uses it, platforms, modules it proves.
 */
export function ChapterCover({
  n,
  title,
  product,
  oneLiner,
  context,
  roles = [],
  platforms = [],
  nodes,
  facts = [],
  aside,
}: {
  n: number;
  title: Tx;
  product: string | { en: string; fr?: string; ar?: string };
  oneLiner: Tx;
  context: Tx | Tx[];
  roles?: { name: Tx; does: Tx }[];
  platforms?: Tx[];
  nodes: NodeId[];
  facts?: { value: number; suffix?: string; prefix?: string; label: Tx }[];
  aside?: ReactNode;
}) {
  const tx = useTx();
  const paras = Array.isArray(context) ? context : [context];
  return (
    <div className="relative px-5 pb-24 pt-[calc(var(--erp-header)+5rem)] md:px-10 xl:pe-[16rem]">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="flex items-end gap-5 border-b border-[var(--erp-hair-2)] pb-6">
            <span className="erp-display text-[clamp(5rem,14vw,11rem)] leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]">
              {String(n).padStart(2, "0")}
            </span>
            <div className="pb-2">
              <p className="erp-kicker">
                {tx({ en: "Chapter", fr: "Chapitre", ar: "الفصل" })} {String(n).padStart(2, "0")} / 05
              </p>
              <p className="erp-display mt-2 text-[clamp(1.5rem,3vw,2.4rem)] text-ink">{tx(title)}</p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <p className="erp-kicker">{tx(product)}</p>
              <h2 className="erp-display mt-4 text-[clamp(2rem,4.4vw,3.9rem)] text-ink">{tx(oneLiner)}</h2>
            </Reveal>
            <div className="mt-8 space-y-4">
              {paras.map((p, i) => (
                <Reveal key={i} delay={0.1 + i * 0.06}>
                  <Body className="max-w-[62ch] text-[1.1rem]">{tx(p)}</Body>
                </Reveal>
              ))}
            </div>
            {facts.length > 0 && (
              <Reveal delay={0.2}>
                <div className="mt-10 grid grid-cols-2 gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)] sm:grid-cols-4">
                  {facts.map((f, i) => (
                    <div key={i} className="bg-paper px-4 py-4">
                      <div className="erp-display text-[2rem] text-ink">
                        <CountUp value={f.value} prefix={f.prefix} suffix={f.suffix} />
                      </div>
                      <div className="mt-1 text-[0.78rem] leading-snug text-mute">{tx(f.label)}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <div className="space-y-8 lg:col-span-5">
            {aside}
            {roles.length > 0 && (
              <Reveal delay={0.15}>
                <p className="erp-kicker mb-3">{tx({ en: "Who works in it", fr: "Qui l'utilise", ar: "من يعمل عليه" })}</p>
                <Spec rows={roles.map((r) => ({ k: r.name, v: r.does }))} />
              </Reveal>
            )}
            {platforms.length > 0 && (
              <Reveal delay={0.2}>
                <p className="erp-kicker mb-3">{tx({ en: "Runs on", fr: "Fonctionne sur", ar: "يعمل على" })}</p>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((p, i) => (
                    <span key={i} className="erp-chip">
                      {tx(p)}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
            <Reveal delay={0.25}>
              <p className="erp-kicker mb-3">
                {tx({ en: "Modules this chapter proves", fr: "Modules prouvés dans ce chapitre", ar: "الوحدات التي يثبتها هذا الفصل" })}
              </p>
              <NodeChips nodes={nodes} />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pinned beat layout                                                  */
/* ------------------------------------------------------------------ */

/**
 * Standard layout inside a <Scene>: copy column + figure column. On mobile
 * the copy sits on top and the figure below. Put <At> blocks in `copy`.
 */
export function SceneLayout({
  copy,
  figure,
  className = "",
  flip = false,
  wide = false,
}: {
  copy: ReactNode;
  figure: ReactNode;
  className?: string;
  flip?: boolean;
  /** Give the figure more room (copy 4/12, figure 8/12). */
  wide?: boolean;
}) {
  return (
    <div
      className={`erp-grid relative flex h-full w-full flex-col px-5 pb-6 pt-[calc(var(--erp-header)+1.25rem)] md:px-10 xl:pe-[16rem] ${className}`}
    >
      <div
        className={`mx-auto grid h-full w-full max-w-[1280px] min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-5 lg:grid-rows-1 lg:items-center lg:gap-12 ${
          wide
            ? flip
              ? "lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]"
              : "lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
            : flip
              ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
              : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        }`}
      >
        <div className={`relative min-h-0 min-w-0 ${flip ? "lg:order-2" : ""}`}>{copy}</div>
        <div className={`relative flex min-h-0 min-w-0 items-start justify-center [contain:inline-size] lg:items-center ${flip ? "lg:order-1" : ""}`}>{figure}</div>
      </div>
    </div>
  );
}

/** Copy block for one beat: kicker, title, body, optional details. */
export function BeatCopy({
  kicker,
  title,
  body,
  details,
  children,
}: {
  kicker: Tx;
  title: Tx;
  body?: Tx;
  details?: Tx[];
  children?: ReactNode;
}) {
  const tx = useTx();
  return (
    <div className="max-w-[34rem]">
      <p className="erp-kicker">{tx(kicker)}</p>
      <h3 className="erp-display mt-3 text-[clamp(1.4rem,min(2.9vw,4.6svh),2.6rem)] text-ink">{tx(title)}</h3>
      {body && <p className="erp-body mt-3 text-[0.93rem] leading-[1.55] md:mt-4 md:text-[1.04rem] md:leading-[1.65]">{tx(body)}</p>}
      {details && details.length > 0 && (
        <Details items={details} className="mt-5 hidden md:block [@media(max-height:700px)]:[&>li:nth-child(n+3)]:hidden" />
      )}
      {children}
    </div>
  );
}

/** A beat counter shown in pinned scenes: 01 — 02 — 03 … with the current one lit. */
export function BeatDots({ count, current, className = "" }: { count: number; current: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} dir="ltr">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-[3px] transition-all duration-500 ${i === current ? "w-8 bg-signal" : i < current ? "w-4 bg-ink" : "w-4 bg-[var(--erp-hair-2)]"}`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flow sections                                                       */
/* ------------------------------------------------------------------ */

/** A non-pinned section with a standard container and heading. */
export function Section({
  id,
  kicker,
  title,
  intro,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  kicker?: Tx;
  title?: Tx;
  intro?: Tx;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const tx = useTx();
  return (
    <section
      id={id}
      className={`relative px-5 py-24 md:px-10 md:py-32 xl:pe-[16rem] ${dark ? "erp-steel" : ""} ${className}`}
    >
      <div className="mx-auto max-w-[1180px]">
        {(kicker || title || intro) && (
          <Reveal className="mb-14 max-w-[52rem]">
            {kicker && <p className={`erp-kicker ${dark ? "!text-white/50" : ""}`}>{tx(kicker)}</p>}
            {title && (
              <h3 className={`erp-display mt-4 text-[clamp(1.8rem,3.6vw,3.2rem)] ${dark ? "text-white" : "text-ink"}`}>
                {tx(title)}
              </h3>
            )}
            {intro && <p className={`erp-body mt-5 ${dark ? "!text-white/65" : ""}`}>{tx(intro)}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * An end-to-end journey as a vertical timeline whose spine fills as you
 * scroll. Each step: who acts, what they do, what the system does.
 */
export function Walkthrough({
  steps,
  className = "",
}: {
  steps: { actor: Tx; action: Tx; effect: Tx; token?: string }[];
  className?: string;
}) {
  const tx = useTx();
  return (
    <Track from={0.75} to={0.45} className={`relative ${className}`}>
      <span className="absolute bottom-0 start-[15px] top-0 w-px bg-[var(--erp-hair-2)]" aria-hidden />
      <span
        className="absolute start-[15px] top-0 w-px origin-top bg-signal"
        style={{ height: "100%", transform: "scaleY(var(--t))" }}
        aria-hidden
      />
      <ol className="space-y-10">
        {steps.map((s, i) => (
          <li key={i} className="relative grid gap-3 ps-12 md:grid-cols-12 md:gap-8">
            <span
              className="erp-mono absolute start-0 top-0 flex h-[31px] w-[31px] items-center justify-center border border-[var(--erp-hair-2)] bg-paper text-[0.68rem] text-ink"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <Reveal className="md:col-span-5">
              <p className="erp-kicker">{tx(s.actor)}</p>
              <p className="mt-2 text-[1.08rem] font-medium leading-snug text-ink">{tx(s.action)}</p>
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-7">
              <div className="border-s-2 border-signal/70 ps-4">
                <p className="erp-kicker !text-[0.62rem]">{tx({ en: "System", fr: "Système", ar: "النظام" })}</p>
                <p className="mt-1.5 text-[0.96rem] leading-relaxed text-graphite">{tx(s.effect)}</p>
                {s.token && <Code className="mt-2 inline-block">{s.token}</Code>}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Track>
  );
}

/** Engineering decisions: chose / over / because. */
export function Decisions({
  items,
  className = "",
  dark = true,
}: {
  items: { decision: Tx; alternative: Tx; reason: Tx }[];
  className?: string;
  dark?: boolean;
}) {
  const tx = useTx();
  const lab = (l: L) => (
    <span className={`erp-mono text-[0.6rem] uppercase tracking-[0.18em] ${dark ? "text-white/40" : "text-faint"}`}>{tx(l)}</span>
  );
  return (
    <div className={`grid gap-px md:grid-cols-2 ${dark ? "bg-white/10" : "bg-[var(--erp-hair)]"} ${className}`}>
      {items.map((d, i) => (
        <Reveal key={i} delay={(i % 2) * 0.08} className={`${dark ? "bg-[#1d1e22]" : "bg-paper"} p-6 md:p-8`}>
          <div className="flex items-start justify-between gap-4">
            <span className={`erp-mono text-[0.7rem] ${dark ? "text-signal" : "text-signal-deep"}`}>
              D{String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              {lab({ en: "Chose", fr: "Choix", ar: "الخيار" })}
              <p className={`mt-1.5 text-[1.05rem] font-medium leading-snug ${dark ? "text-white" : "text-ink"}`}>{tx(d.decision)}</p>
            </div>
            <div>
              {lab({ en: "Over", fr: "Plutôt que", ar: "بدلًا من" })}
              <p className={`mt-1.5 text-[0.92rem] leading-snug line-through decoration-1 ${dark ? "text-white/45 decoration-white/30" : "text-faint decoration-[var(--erp-hair-2)]"}`}>
                {tx(d.alternative)}
              </p>
            </div>
            <div>
              {lab({ en: "Because", fr: "Parce que", ar: "لأنّ" })}
              <p className={`mt-1.5 text-[0.95rem] leading-relaxed ${dark ? "text-white/75" : "text-graphite"}`}>{tx(d.reason)}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** A row of large proof numbers. */
export function ProofStrip({
  items,
  className = "",
  dark = false,
}: {
  items: { value: number; prefix?: string; suffix?: string; digits?: number; label: Tx; note?: Tx }[];
  className?: string;
  dark?: boolean;
}) {
  const tx = useTx();
  return (
    <div
      className={`grid grid-cols-2 gap-px md:grid-cols-3 lg:grid-cols-4 ${dark ? "bg-white/10" : "bg-[var(--erp-hair)]"} border ${
        dark ? "border-white/10" : "border-[var(--erp-hair)]"
      } ${className}`}
    >
      {items.map((it, i) => (
        <Reveal key={i} delay={(i % 4) * 0.05} className={`${dark ? "bg-[#1d1e22]" : "bg-paper"} p-5 md:p-6`}>
          <div className={`erp-display text-[clamp(2rem,3.6vw,3rem)] ${dark ? "text-white" : "text-ink"}`}>
            <CountUp value={it.value} prefix={it.prefix} suffix={it.suffix} digits={it.digits} />
          </div>
          <p className={`mt-2 text-[0.86rem] leading-snug ${dark ? "text-white/70" : "text-graphite"}`}>{tx(it.label)}</p>
          {it.note && <p className={`erp-mono mt-2 text-[0.62rem] ${dark ? "text-white/40" : "text-faint"}`}>{tx(it.note)}</p>}
        </Reveal>
      ))}
    </div>
  );
}

/** A thin divider between chapter blocks with a label and registration marks. */
export function Rule({ label, className = "" }: { label?: Tx; className?: string }) {
  const tx = useTx();
  return (
    <div className={`flex items-center gap-3 px-5 md:px-10 xl:pe-[16rem] ${className}`}>
      <span className="erp-reg" />
      <span className="h-px flex-1 bg-[var(--erp-hair)]" />
      {label && <span className="erp-kicker">{tx(label)}</span>}
      <span className="h-px w-10 bg-[var(--erp-hair)]" />
      <span className="erp-reg" />
    </div>
  );
}
