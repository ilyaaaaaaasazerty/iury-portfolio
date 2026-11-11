"use client";

/**
 * The scroll engine behind the story.
 *
 *  <Scene beats={4}>   a pinned stage. While the reader scrolls through it,
 *                      the stage stays on screen and its progress is written
 *                      to CSS variables (--p, --b0 … --bN) — see lib/erp/sv.ts.
 *                      `useScene().beat` gives the current beat for React.
 *  <At from to>        content visible only during some beats (crossfades).
 *  <Track>             a non-pinned element that exposes --t (0 → 1) as it
 *                      crosses the viewport.
 *  <Reveal>            fade/rise once on entering the viewport.
 *  <CountUp>           a number that counts up once visible.
 *  <LightUp nodes>     marks the point where a chapter proves ERP modules;
 *                      the map lights them when the reader passes it.
 *
 * One rAF-batched scheduler does all reads, then all writes, so scrolling
 * never thrashes layout and nothing re-renders per frame.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { NodeId } from "@/lib/erp/nodes";
import { CHAPTERS } from "@/lib/erp/nodes";
import { useNumber } from "@/lib/erp/i18n";

/* ------------------------------------------------------------------ */
/* Frame scheduler                                                     */
/* ------------------------------------------------------------------ */

interface Job {
  read(): void;
  write(): void;
}

const jobs = new Set<Job>();
let queued = false;
let installed = false;

function run() {
  queued = false;
  jobs.forEach((j) => j.read());
  jobs.forEach((j) => j.write());
}

export function requestScrollFrame() {
  if (queued || typeof window === "undefined") return;
  queued = true;
  requestAnimationFrame(run);
}

function install() {
  if (installed) return;
  installed = true;
  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame);
  window.addEventListener("load", requestScrollFrame);
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => requestScrollFrame()).observe(document.documentElement);
  }
}

function useScrollJob(make: () => Job & { dispose?: () => void }, deps: unknown[]) {
  useEffect(() => {
    install();
    const job = make();
    jobs.add(job);
    requestScrollFrame();
    return () => {
      jobs.delete(job);
      job.dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth-scroll to an absolute Y using Lenis when present. */
export function scrollToY(y: number) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

export function scrollToElement(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY + offset);
}

/* ------------------------------------------------------------------ */
/* Tiny external store helper                                          */
/* ------------------------------------------------------------------ */

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: T) {
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Scene (pinned)                                                      */
/* ------------------------------------------------------------------ */

interface SceneValue {
  id: string;
  beats: number;
  beat: number;
  subscribe(cb: (p: number) => void): () => void;
  getProgress(): number;
  /** Absolute scroll Y at which this scene reaches progress p. */
  scrollFor(p: number): number;
}

const SceneCtx = createContext<SceneValue | null>(null);

export function useScene(): SceneValue {
  const v = useContext(SceneCtx);
  if (!v) throw new Error("useScene must be used inside <Scene>");
  return v;
}

export function useMaybeScene(): SceneValue | null {
  return useContext(SceneCtx);
}

/** Run `cb(p)` on every scroll frame of the enclosing scene (no re-render). */
export function useSceneProgress(cb: (p: number) => void) {
  const scene = useScene();
  const ref = useRef(cb);
  ref.current = cb;
  const { subscribe } = scene;
  useEffect(() => subscribe((p) => ref.current(p)), [subscribe]);
}

/** Global scroll-length scale for pinned scenes (lower = less scrolling per beat). */
const SCROLL_SCALE = 0.72;

export function Scene({
  id,
  beats,
  length = 100,
  className = "",
  stageClassName = "",
  label,
  children,
}: {
  id?: string;
  /** Number of beats. Each beat is `length`vh of scrolling. */
  beats: number;
  length?: number;
  className?: string;
  stageClassName?: string;
  label?: string;
  children: ReactNode;
}) {
  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState(0);
  const subs = useRef(new Set<(p: number) => void>());
  const prog = useRef(-1);
  const beatRef = useRef(0);

  useScrollJob(() => {
    let p = 0;
    return {
      read() {
        const el = outer.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = r.height - window.innerHeight;
        p = dist > 0 ? Math.min(1, Math.max(0, -r.top / dist)) : r.top <= 0 ? 1 : 0;
      },
      write() {
        const el = stage.current;
        if (!el || p === prog.current) return;
        prog.current = p;
        el.style.setProperty("--p", p.toFixed(4));
        for (let i = 0; i < beats; i++) {
          el.style.setProperty(`--b${i}`, Math.min(1, Math.max(0, p * beats - i)).toFixed(4));
        }
        const b = Math.min(beats - 1, Math.floor(p * beats));
        if (b !== beatRef.current) {
          beatRef.current = b;
          setBeat(b);
        }
        subs.current.forEach((cb) => cb(p));
      },
    };
  }, [beats]);

  const subscribe = useCallback((cb: (p: number) => void) => {
    subs.current.add(cb);
    if (prog.current >= 0) cb(prog.current);
    return () => {
      subs.current.delete(cb);
    };
  }, []);
  const getProgress = useCallback(() => Math.max(0, prog.current), []);
  const scrollFor = useCallback((p: number) => {
    const el = outer.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY + p * (r.height - window.innerHeight);
  }, []);

  const value = useMemo<SceneValue>(
    () => ({ id: id ?? "", beats, beat, subscribe, getProgress, scrollFor }),
    [id, beats, beat, subscribe, getProgress, scrollFor]
  );

  const init = useMemo(() => {
    const s: Record<string, number> = { "--p": 0 };
    for (let i = 0; i < beats; i++) s[`--b${i}`] = 0;
    return s as CSSProperties;
  }, [beats]);

  return (
    <section
      id={id}
      ref={outer}
      aria-label={label}
      className={`erp-scene relative ${className}`}
      style={{ height: `calc(${Math.round(beats * length * SCROLL_SCALE)}vh + 100svh)` }}
    >
      <div
        ref={stage}
        data-beat={beat}
        className={`erp-stage sticky top-0 h-[100svh] w-full overflow-hidden ${stageClassName}`}
        style={init}
      >
        <SceneCtx.Provider value={value}>{children}</SceneCtx.Provider>
      </div>
    </section>
  );
}

/** Visible only while the scene's beat is within [from, to]. Stack several in an <AtStack>. */
export function At({
  from,
  to = from,
  className = "",
  style,
  children,
}: {
  from: number;
  to?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { beat } = useScene();
  const on = beat >= from && beat <= to;
  return (
    <div data-on={on ? "" : undefined} aria-hidden={!on} className={`erp-at ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Puts its children in one grid cell so <At> blocks crossfade in place. */
export function AtStack({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`erp-stack ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Track (non-pinned progress)                                         */
/* ------------------------------------------------------------------ */

/**
 * Exposes --t on itself: 0 when its top reaches `from` × viewport height,
 * 1 when its bottom reaches `to` × viewport height.
 */
export function Track({
  from = 0.85,
  to = 0.3,
  className = "",
  style,
  id,
  onProgress,
  children,
}: {
  from?: number;
  to?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  onProgress?: (t: number) => void;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useScrollJob(() => {
    let t = 0;
    let last = -1;
    return {
      read() {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height + vh * (from - to);
        t = total > 0 ? Math.min(1, Math.max(0, (vh * from - r.top) / total)) : 0;
      },
      write() {
        if (t === last) return;
        last = t;
        ref.current?.style.setProperty("--t", t.toFixed(4));
        cb.current?.(t);
      },
    };
  }, [from, to]);
  return (
    <div ref={ref} id={id} className={className} style={{ ["--t" as string]: 0, ...style } as CSSProperties}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal / in-view                                                    */
/* ------------------------------------------------------------------ */

export function useInView<T extends Element>(opts: { once?: boolean; margin?: string; threshold?: number } = {}) {
  const { once = true, margin = "0px 0px -12% 0px", threshold = 0 } = opts;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    let raf = 0;
    const stop = () => {
      done = true;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) stop();
        } else if (!once) setInView(false);
      },
      { rootMargin: margin, threshold }
    );
    // Fallback: after a programmatic jump (deep link, map click) the observer can miss the
    // first intersection while the page is still busy hydrating. Check the rect directly too.
    const check = () => {
      raf = 0;
      if (done) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.88 && r.bottom > 0) {
        setInView(true);
        if (once) stop();
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    io.observe(el);
    if (once) {
      window.addEventListener("scroll", onScroll, { passive: true });
      raf = requestAnimationFrame(check);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      stop();
    };
  }, [once, margin, threshold]);
  return [ref, inView] as const;
}

export function Reveal({
  delay = 0,
  className = "",
  style,
  once = true,
  children,
}: {
  delay?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ once });
  return (
    <div
      ref={ref}
      data-in={inView ? "" : undefined}
      className={`erp-reveal ${className}`}
      style={{ ["--d" as string]: `${delay}s`, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp                                                             */
/* ------------------------------------------------------------------ */

export function CountUp({
  value,
  digits = 0,
  duration = 1.4,
  prefix = "",
  suffix = "",
  start,
  className = "",
}: {
  value: number;
  digits?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** Control the start yourself (e.g. `start={beat >= 2}` inside a scene). */
  start?: boolean;
  className?: string;
}) {
  const fmt = useNumber();
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const go = start ?? inView;
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!go || done.current) return;
    done.current = true;
    if (prefersReducedMotion()) {
      setN(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / (duration * 1000));
      setN(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, value, duration]);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {prefix}
      {fmt(n, digits)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ERP map state: which modules are proven so far                      */
/* ------------------------------------------------------------------ */

interface Marker {
  nodes: NodeId[];
  on: boolean;
  target: () => number;
}

export interface LitState {
  lit: ReadonlySet<NodeId>;
  /** Increments each time a marker covering the node is passed — key animations on it. */
  pulses: Readonly<Record<string, number>>;
  /** The node lit most recently. */
  last: NodeId | null;
}

const markers = new Map<number, Marker>();
let markerSeq = 0;
const EMPTY_LIT: LitState = { lit: new Set(), pulses: {}, last: null };
const litStore = createStore<LitState>(EMPTY_LIT);

function recomputeLit(turnedOn: Marker | null) {
  const lit = new Set<NodeId>();
  markers.forEach((m) => {
    if (m.on) m.nodes.forEach((n) => lit.add(n));
  });
  const prev = litStore.get();
  const pulses = { ...prev.pulses };
  let last = prev.last;
  if (turnedOn) {
    turnedOn.nodes.forEach((n) => {
      pulses[n] = (pulses[n] || 0) + 1;
    });
    last = turnedOn.nodes[turnedOn.nodes.length - 1] ?? last;
  }
  litStore.set({ lit, pulses, last });
}

export function useLitNodes(): LitState {
  return useSyncExternalStore(litStore.subscribe, litStore.get, () => EMPTY_LIT);
}

/** Scroll to the first place in the story that proves `node`. */
export function scrollToNode(node: NodeId) {
  let best: number | null = null;
  markers.forEach((m) => {
    if (!m.nodes.includes(node)) return;
    const y = m.target();
    if (best === null || y < best) best = y;
  });
  if (best !== null) scrollToY(Math.max(0, (best as number) + 2));
}

/**
 * Place where a chapter proves modules. Inside a <Scene>, the nodes light
 * when the scene reaches progress `at`; elsewhere, when this marker passes
 * 60% of the viewport height.
 */
export function LightUp({ nodes, at = 0.5 }: { nodes: NodeId[]; at?: number }) {
  const scene = useMaybeScene();
  const ref = useRef<HTMLSpanElement>(null);
  const key = nodes.join(",");
  const sceneSubscribe = scene?.subscribe;
  const sceneScrollFor = scene?.scrollFor;

  // Inside a scene: follow its progress.
  useEffect(() => {
    if (!sceneSubscribe || !sceneScrollFor) return;
    const id = ++markerSeq;
    const m: Marker = { nodes, on: false, target: () => sceneScrollFor(at) };
    markers.set(id, m);
    const off = sceneSubscribe((p) => {
      const on = p >= at;
      if (on !== m.on) {
        m.on = on;
        recomputeLit(on ? m : null);
      }
    });
    return () => {
      off();
      markers.delete(id);
      recomputeLit(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, at, sceneSubscribe, sceneScrollFor]);

  // Outside a scene: follow the marker's own position.
  useScrollJob(() => {
    if (sceneSubscribe) return { read() {}, write() {} };
    const id = ++markerSeq;
    const m: Marker = {
      nodes,
      on: false,
      target: () => {
        const el = ref.current;
        return el ? el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6 : 0;
      },
    };
    markers.set(id, m);
    let on = false;
    return {
      read() {
        const el = ref.current;
        if (el) on = el.getBoundingClientRect().top < window.innerHeight * 0.6;
      },
      write() {
        if (on !== m.on) {
          m.on = on;
          recomputeLit(on ? m : null);
        }
      },
      dispose() {
        markers.delete(id);
        recomputeLit(null);
      },
    };
  }, [key, !!sceneSubscribe]);

  return <span ref={ref} aria-hidden className="pointer-events-none block h-px w-px" />;
}

/* ------------------------------------------------------------------ */
/* Story position: opening / which chapter / finale                    */
/* ------------------------------------------------------------------ */

export interface StoryPos {
  /** Index into CHAPTERS, or -1 before the first chapter. */
  chapter: number;
  /** True once the opening has scrolled away (the map rail can take over). */
  pastOpening: boolean;
  /** True while the finale (full map) is on screen. */
  inFinale: boolean;
  /** Overall page progress 0 → 1. */
  page: number;
}

const INITIAL_POS: StoryPos = { chapter: -1, pastOpening: false, inFinale: false, page: 0 };
const posStore = createStore<StoryPos>(INITIAL_POS);

export function useStoryPos(): StoryPos {
  return useSyncExternalStore(posStore.subscribe, posStore.get, () => INITIAL_POS);
}

/** Mount once (in the story root): tracks which chapter is on screen. */
export function StoryTracker() {
  useScrollJob(() => {
    let next = INITIAL_POS;
    return {
      read() {
        const vh = window.innerHeight;
        const mid = vh * 0.5;
        let chapter = -1;
        CHAPTERS.forEach((c, i) => {
          const el = document.getElementById(c.id);
          if (el && el.getBoundingClientRect().top <= mid) chapter = i;
        });
        const opening = document.getElementById("opening");
        const pastOpening = opening ? opening.getBoundingClientRect().bottom < vh * 0.55 : true;
        const finale = document.getElementById("finale");
        let inFinale = false;
        if (finale) {
          const r = finale.getBoundingClientRect();
          inFinale = r.top < vh * 0.6 && r.bottom > vh * 0.4;
          if (r.top <= mid) chapter = CHAPTERS.length - 1;
        }
        const max = document.documentElement.scrollHeight - vh;
        const page = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        next = { chapter, pastOpening, inFinale, page };
      },
      write() {
        const prev = posStore.get();
        if (
          prev.chapter !== next.chapter ||
          prev.pastOpening !== next.pastOpening ||
          prev.inFinale !== next.inFinale ||
          Math.abs(prev.page - next.page) > 0.002
        ) {
          posStore.set(next);
        }
      },
    };
  }, []);
  return null;
}

/* ------------------------------------------------------------------ */
/* Deep links: ?at=<element-id>[:progress]                             */
/* ------------------------------------------------------------------ */

/**
 * `/?at=pos` scrolls to the chapter; `/?at=immo-isolation:0.6` scrolls a
 * pinned scene to 60% of its progress. Used for sharing a precise moment
 * and for automated screenshots.
 */
export function DeepLink() {
  useEffect(() => {
    const at = new URLSearchParams(window.location.search).get("at");
    if (!at) return;
    const [id, raw] = at.split(":");
    const p = raw === undefined ? 0 : Math.min(1, Math.max(0, parseFloat(raw) || 0));
    const go = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const y = r.top + window.scrollY + p * Math.max(0, r.height - window.innerHeight);
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      requestScrollFrame();
    };
    const t1 = setTimeout(go, 250);
    const t2 = setTimeout(go, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  return null;
}
