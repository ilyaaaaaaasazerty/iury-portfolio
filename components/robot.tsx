"use client";

import { useEffect, useId, useRef } from "react";

export type Pose = "idle" | "wave" | "point" | "think" | "happy" | "amazed" | "sleep";

/**
 * Joint targets per pose. Angles are SVG degrees (positive = clockwise);
 * arms hang straight down at 0, so the viewer-left arm swings outward with
 * positive angles and the viewer-right arm with negative ones.
 */
interface Rig {
  armL: number;
  foreL: number;
  armR: number;
  foreR: number;
  tilt: number;
  lid: number; // 0 open → 1 closed
  low: number; // lower lid, for a smiling squint
  eye: number; // eyeball scale
  bounce: number;
}

const RIGS: Record<Pose, Rig> = {
  idle: { armL: 9, foreL: -12, armR: -9, foreR: 12, tilt: 0, lid: 0.06, low: 0, eye: 1, bounce: 1 },
  wave: { armL: 12, foreL: -14, armR: -150, foreR: -24, tilt: -6, lid: 0, low: 0.22, eye: 1, bounce: 1.4 },
  point: { armL: 8, foreL: -10, armR: -92, foreR: -6, tilt: 6, lid: 0.04, low: 0, eye: 1, bounce: 0.6 },
  think: { armL: 202, foreL: 4, armR: -14, foreR: 18, tilt: 9, lid: 0.32, low: 0, eye: 0.96, bounce: 0.5 },
  happy: { armL: 150, foreL: 20, armR: -150, foreR: -20, tilt: -3, lid: 0, low: 0.3, eye: 1.04, bounce: 3.2 },
  amazed: { armL: 38, foreL: -46, armR: -38, foreR: 46, tilt: 0, lid: 0, low: 0, eye: 1.16, bounce: 1.8 },
  sleep: { armL: 4, foreL: -4, armR: -4, foreR: 4, tilt: 5, lid: 1, low: 0, eye: 1, bounce: 0.4 },
};

type Screen = "idle" | "talk" | "think" | "heart" | "wow" | "sleep";
const SCREEN_FOR: Record<Pose, Screen> = {
  idle: "idle",
  wave: "heart",
  point: "idle",
  think: "think",
  happy: "heart",
  amazed: "wow",
  sleep: "sleep",
};

// Shoulder pivots and head centre, in viewBox units.
const SHOULDER_L = [96, 214] as const;
const SHOULDER_R = [264, 214] as const;
const NECK = [180, 132] as const;
const HEAD_CENTER = [180, 92] as const;

interface Props {
  pose?: Pose;
  /** Shows the "talking" equaliser on the chest screen. */
  speaking?: boolean;
  /** Mirror horizontally (RTL), so pointing goes toward the content. */
  mirror?: boolean;
  /** "head" crops to the head only — used as the logo and the mobile companion. */
  variant?: "full" | "head";
  className?: string;
  title?: string;
}

export default function Robot({
  pose = "idle",
  speaking = false,
  mirror = false,
  variant = "full",
  className = "",
  title = "IURY",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const upper = useRef<SVGGElement>(null);
  const head = useRef<SVGGElement>(null);
  const armL = useRef<SVGGElement>(null);
  const foreL = useRef<SVGGElement>(null);
  const armR = useRef<SVGGElement>(null);
  const foreR = useRef<SVGGElement>(null);
  const irisL = useRef<SVGGElement>(null);
  const irisR = useRef<SVGGElement>(null);
  const ballL = useRef<SVGGElement>(null);
  const ballR = useRef<SVGGElement>(null);
  const lidTopL = useRef<SVGRectElement>(null);
  const lidTopR = useRef<SVGRectElement>(null);
  const lidLowL = useRef<SVGRectElement>(null);
  const lidLowR = useRef<SVGRectElement>(null);
  const treadL = useRef<SVGRectElement>(null);
  const treadR = useRef<SVGRectElement>(null);
  const wheels = useRef<SVGGElement>(null);

  // Read inside the animation loop without restarting it.
  const poseRef = useRef(pose);
  poseRef.current = pose;
  const mirrorRef = useRef(mirror);
  mirrorRef.current = mirror;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur: Rig = { ...RIGS.sleep };
    const mouse = { x: 0, y: 0, active: false };
    let look = { x: 0, y: 0, tilt: 0 };
    let tread = 0;
    let lastScroll = window.scrollY;
    let vel = 0;
    let lean = 0;
    let nextBlink = performance.now() + 1800;
    let blinkStart = -1;
    let last = performance.now();
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const set = (el: Element | null, tf: string) => el?.setAttribute("transform", tf);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = RIGS[poseRef.current];
      const k = 1 - Math.exp(-dt * (reduce ? 30 : 7));
      (Object.keys(cur) as (keyof Rig)[]).forEach((key) => {
        cur[key] += (target[key] - cur[key]) * k;
      });

      const time = now / 1000;
      const p = poseRef.current;

      // scroll → treads roll, body leans into the motion
      const sy = window.scrollY;
      vel += ((sy - lastScroll) / Math.max(dt, 0.001) - vel) * 0.15;
      lastScroll = sy;
      lean += (Math.max(-5, Math.min(5, -vel * 0.004)) - lean) * 0.1;
      const roll = reduce ? 0 : vel * 0.03 + (p === "happy" ? 30 : 0);
      tread += roll * dt * 4;

      // where to look: the cursor, else toward the content
      let tx = 0;
      let ty = 0;
      let tt = 0;
      const box = svg.current?.getBoundingClientRect();
      const vb = svg.current?.viewBox.baseVal;
      if (box && vb && mouse.active && p !== "sleep") {
        const fx = (HEAD_CENTER[0] - vb.x) / vb.width;
        const hx = mirrorRef.current ? box.right - fx * box.width : box.left + fx * box.width;
        const hy = box.top + ((HEAD_CENTER[1] - vb.y) / vb.height) * box.height;
        let dx = mouse.x - hx;
        const dy = mouse.y - hy;
        if (mirrorRef.current) dx = -dx;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 260);
        tx = (dx / dist) * 9 * reach;
        ty = (dy / dist) * 8 * reach;
        tt = Math.max(-7, Math.min(7, dx / 90));
      } else if (p === "point") {
        tx = 7;
      }
      if (p === "think") {
        tx = -5;
        ty = -7;
      }
      look = {
        x: look.x + (tx - look.x) * 0.18,
        y: look.y + (ty - look.y) * 0.18,
        tilt: look.tilt + (tt - look.tilt) * 0.08,
      };

      // blinking
      let blink = 0;
      if (!reduce && p !== "sleep") {
        if (blinkStart < 0 && now > nextBlink) blinkStart = now;
        if (blinkStart >= 0) {
          const bt = (now - blinkStart) / 150;
          blink = bt < 1 ? Math.sin(bt * Math.PI) : 0;
          if (bt >= 1) {
            blinkStart = -1;
            nextBlink = now + 2200 + Math.random() * 3800;
          }
        }
      }

      const sway = reduce ? 0 : Math.sin(time * 1.6);
      const bob = reduce ? 0 : -Math.abs(Math.sin(time * (p === "happy" ? 6 : 1.8))) * cur.bounce;
      const waveOsc = p === "wave" && !reduce ? Math.sin(time * 9) * 20 : 0;

      set(upper.current, `translate(0 ${bob.toFixed(2)}) rotate(${lean.toFixed(2)} 180 372)`);
      set(
        head.current,
        `translate(${NECK[0]} ${NECK[1]}) rotate(${(cur.tilt + look.tilt + sway * 1.2).toFixed(2)})`
      );
      set(armL.current, `translate(${SHOULDER_L[0]} ${SHOULDER_L[1]}) rotate(${(cur.armL + sway * 2).toFixed(2)})`);
      set(foreL.current, `translate(0 52) rotate(${cur.foreL.toFixed(2)})`);
      set(armR.current, `translate(${SHOULDER_R[0]} ${SHOULDER_R[1]}) rotate(${(cur.armR - sway * 2).toFixed(2)})`);
      set(foreR.current, `translate(0 52) rotate(${(cur.foreR + waveOsc).toFixed(2)})`);

      const iris = `translate(${look.x.toFixed(2)} ${look.y.toFixed(2)})`;
      set(irisL.current, iris);
      set(irisR.current, iris);
      const ball = `scale(${cur.eye.toFixed(3)})`;
      set(ballL.current, ball);
      set(ballR.current, ball);

      const lid = Math.min(1, cur.lid + blink);
      const lidH = (lid * 56).toFixed(2);
      const lowH = (cur.low * 56).toFixed(2);
      for (const r of [lidTopL.current, lidTopR.current]) r?.setAttribute("height", lidH);
      for (const r of [lidLowL.current, lidLowR.current]) {
        r?.setAttribute("height", lowH);
        r?.setAttribute("y", (28 - cur.low * 56).toFixed(2));
      }

      const offset = (-tread % 28).toFixed(2);
      treadL.current?.setAttribute("stroke-dashoffset", offset);
      treadR.current?.setAttribute("stroke-dashoffset", offset);
      wheels.current
        ?.querySelectorAll<SVGGElement>("[data-wheel]")
        .forEach((w) => {
          const [cx, cy] = (w.dataset.wheel ?? "0 0").split(" ");
          w.setAttribute("transform", `rotate(${(tread * 6) % 360} ${cx} ${cy})`);
        });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const screen: Screen = speaking ? "talk" : SCREEN_FOR[pose];
  const viewBox = variant === "head" ? "84 40 192 112" : "-24 0 408 440";
  const g = (n: string) => `${uid}-${n}`;

  return (
    <svg
      ref={svg}
      viewBox={viewBox}
      role="img"
      aria-label={title}
      className={`select-none ${className}`}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id={g("body")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f5f2" />
          <stop offset="0.55" stopColor="#e3e2de" />
          <stop offset="1" stopColor="#c6c5c2" />
        </linearGradient>
        <linearGradient id={g("limb")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f1f0ec" />
          <stop offset="1" stopColor="#c9c8c4" />
        </linearGradient>
        <radialGradient id={g("barrel")} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f7f6f3" />
          <stop offset="1" stopColor="#c4c3bf" />
        </radialGradient>
        <radialGradient id={g("iris")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5d5f66" />
          <stop offset="0.7" stopColor="#2c2d33" />
          <stop offset="1" stopColor="#141418" />
        </radialGradient>
        <radialGradient id={g("floor")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(19,19,22,0.28)" />
          <stop offset="1" stopColor="rgba(19,19,22,0)" />
        </radialGradient>
        <clipPath id={g("eye")}>
          <circle cx="0" cy="0" r="27" />
        </clipPath>
      </defs>

      {variant === "full" && <ellipse cx="180" cy="416" rx="150" ry="16" fill={`url(#${g("floor")})`} />}

      {/* ---------- treads ---------- */}
      <g ref={wheels}>
        <Tread x={60} refRect={treadL} />
        <Tread x={212} refRect={treadR} />
        <rect x="134" y="318" width="92" height="56" rx="12" fill="#3d3e43" />
        <rect x="150" y="330" width="60" height="8" rx="4" fill="#2a2b2f" />
      </g>

      {/* ---------- upper body: bobs and leans ---------- */}
      <g ref={upper}>
        {/* neck */}
        <rect x="171" y="126" width="18" height="50" rx="4" fill="#44454a" />
        <rect x="166" y="146" width="28" height="7" rx="3" fill="#5c5d62" />
        <rect x="166" y="160" width="28" height="7" rx="3" fill="#5c5d62" />

        {/* body */}
        <rect x="92" y="168" width="176" height="162" rx="24" fill={`url(#${g("body")})`} stroke="#b4b4b7" strokeWidth="1.5" />
        <rect x="104" y="168" width="152" height="18" rx="9" fill="#56575c" />
        <rect x="118" y="174" width="16" height="6" rx="3" fill="#3a3b40" />
        <rect x="224" y="174" width="14" height="6" rx="3" fill="#3a3b40" />
        <rect x="116" y="198" width="128" height="102" rx="14" fill="#ecebe7" stroke="#bdbdc0" strokeWidth="1.5" />
        {[
          [126, 208],
          [234, 208],
          [126, 290],
          [234, 290],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="#a7a7ab" />
        ))}

        {/* chest screen */}
        <rect x="136" y="212" width="88" height="46" rx="9" fill="#17181c" stroke="#0a0a0c" strokeWidth="1.5" />
        <ChestScreen mode={screen} />
        {/* the whole SVG flips for RTL; flip the nameplate back so it stays readable */}
        <text
          transform={mirror ? "translate(360 0) scale(-1 1)" : undefined}
          x="180"
          y="285"
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          letterSpacing="2.5"
          fill="#85868c"
          style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
        >
          IURY
        </text>
        <line x1="160" y1="311" x2="200" y2="311" stroke="#8e8f94" strokeWidth="3" strokeLinecap="round" />
        <line x1="160" y1="318" x2="200" y2="318" stroke="#8e8f94" strokeWidth="3" strokeLinecap="round" />

        {/* head */}
        <g ref={head}>
          <rect x="-10" y="-22" width="20" height="26" rx="4" fill="#4a4b50" />
          <rect x="-30" y="-62" width="60" height="38" rx="9" fill="#d1d0cc" stroke="#a8a8ab" strokeWidth="1.5" />
          <Eye cx={-46} g={g} ball={ballL} iris={irisL} lidTop={lidTopL} lidLow={lidLowL} />
          <Eye cx={46} g={g} ball={ballR} iris={irisR} lidTop={lidTopR} lidLow={lidLowR} />
        </g>

        {/* arms */}
        <Arm g={g} arm={armL} fore={foreL} />
        <Arm g={g} arm={armR} fore={foreR} />
        {[SHOULDER_L, SHOULDER_R].map(([cx, cy]) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r="15" fill="#48494e" />
            <circle cx={cx} cy={cy} r="7" fill="#c8c8cb" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function Tread({ x, refRect }: { x: number; refRect: React.RefObject<SVGRectElement | null> }) {
  const wheels: [number, number, number][] = [
    [x + 24, 380, 19],
    [x + 62, 384, 16],
    [x + 44, 340, 10],
  ];
  return (
    <g>
      <rect x={x} y="316" width="88" height="98" rx="38" fill="#2f3035" />
      <rect
        ref={refRect}
        x={x + 3}
        y="319"
        width="82"
        height="92"
        rx="35"
        fill="none"
        stroke="#1b1c20"
        strokeWidth="7"
        strokeDasharray="16 12"
      />
      {wheels.map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={r} fill="#cfcecb" stroke="#8d8e92" strokeWidth="1.5" />
          <g data-wheel={`${cx} ${cy}`}>
            <line x1={cx - r + 4} y1={cy} x2={cx + r - 4} y2={cy} stroke="#7a7b80" strokeWidth="2" />
            <line x1={cx} y1={cy - r + 4} x2={cx} y2={cy + r - 4} stroke="#7a7b80" strokeWidth="2" />
          </g>
          <circle cx={cx} cy={cy} r={r * 0.32} fill="#5f6065" />
        </g>
      ))}
    </g>
  );
}

function Eye({
  cx,
  g,
  ball,
  iris,
  lidTop,
  lidLow,
}: {
  cx: number;
  g: (n: string) => string;
  ball: React.RefObject<SVGGElement | null>;
  iris: React.RefObject<SVGGElement | null>;
  lidTop: React.RefObject<SVGRectElement | null>;
  lidLow: React.RefObject<SVGRectElement | null>;
}) {
  return (
    <g transform={`translate(${cx} -40)`}>
      <circle cx="3" cy="5" r="41" fill="#9d9da1" />
      <circle r="41" fill={`url(#${g("barrel")})`} stroke="#a3a3a7" strokeWidth="2" />
      <circle r="33" fill="#38393e" />
      <g ref={ball}>
        <g clipPath={`url(#${g("eye")})`}>
          <circle r="27" fill="#f7f7f4" />
          <g ref={iris}>
            <circle r="15.5" fill={`url(#${g("iris")})`} />
            <circle r="7.5" fill="#09090b" />
            <circle cx="-5" cy="-6" r="4.2" fill="#fff" />
            <circle cx="4.5" cy="5" r="1.7" fill="#fff" opacity="0.75" />
          </g>
          <rect ref={lidTop} x="-30" y="-28" width="60" height="3" fill="#d6d5d1" />
          <rect ref={lidLow} x="-30" y="28" width="60" height="0" fill="#d6d5d1" />
        </g>
      </g>
      <path d="M -22 -14 A 26 26 0 0 1 -4 -25" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45" />
    </g>
  );
}

function Arm({
  g,
  arm,
  fore,
}: {
  g: (n: string) => string;
  arm: React.RefObject<SVGGElement | null>;
  fore: React.RefObject<SVGGElement | null>;
}) {
  return (
    <g ref={arm}>
      <rect x="-11" y="-2" width="22" height="52" rx="10" fill={`url(#${g("limb")})`} stroke="#b0b0b3" strokeWidth="1.5" />
      <g ref={fore}>
        <rect x="-12" y="2" width="24" height="40" rx="10" fill={`url(#${g("limb")})`} stroke="#b0b0b3" strokeWidth="1.5" />
        <rect x="-9" y="40" width="18" height="7" rx="2" fill="#48494e" />
        <path d="M -9 46 l -6 16 l 5 4 l 6 -14 z" fill="#3b3c41" />
        <path d="M 9 46 l 6 16 l -5 4 l -6 -14 z" fill="#3b3c41" />
      </g>
      <circle cx="0" cy="52" r="9" fill="#48494e" />
    </g>
  );
}

/** The little display on IURY's chest — his mood at a glance. */
function ChestScreen({ mode }: { mode: Screen }) {
  const orange = "#ff6a2b";
  if (mode === "talk") {
    return (
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            className="eq-bar"
            x={150 + i * 9.5}
            y="222"
            width="5"
            height="26"
            rx="2.5"
            fill={orange}
            style={{ animationDelay: `${(i % 4) * 0.11}s` }}
          />
        ))}
      </g>
    );
  }
  if (mode === "think") {
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <circle key={i} className="think-dot" cx={164 + i * 16} cy="235" r="5" fill={orange} style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </g>
    );
  }
  if (mode === "heart") {
    return (
      <path
        className="heart-beat"
        d="M180 249 C 160 236 158 224 167 220 C 173 217 178 221 180 225 C 182 221 187 217 193 220 C 202 224 200 236 180 249 Z"
        fill={orange}
      />
    );
  }
  if (mode === "wow") {
    return (
      <g fill={orange}>
        <rect className="think-dot" x="176" y="219" width="8" height="18" rx="4" />
        <circle cx="180" cy="245" r="4" />
      </g>
    );
  }
  if (mode === "sleep") {
    return (
      <text x="180" y="241" textAnchor="middle" fontSize="13" fontWeight="700" fill={orange} opacity="0.6" style={{ fontFamily: "monospace" }}>
        z z z
      </text>
    );
  }
  // idle: a heartbeat trace
  return (
    <path
      className="pulse-line"
      d="M142 236 H162 L168 226 L175 246 L181 230 L186 236 H218"
      stroke={orange}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
