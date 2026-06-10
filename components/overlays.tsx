/** Global cinematic overlays: grain, vignette, scanlines, and a viewfinder HUD. */
export default function Overlays() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="scanlines" aria-hidden />
      <div className="vignette" aria-hidden />
      <ViewfinderHud />
    </>
  );
}

function ViewfinderHud() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95] hidden md:block"
    >
      {/* corner brackets */}
      <Bracket className="left-5 top-5" d="M0 14V0h14" />
      <Bracket className="right-5 top-5" d="M14 14V0H0" />
      <Bracket className="left-5 bottom-5" d="M0 0v14h14" />
      <Bracket className="right-5 bottom-5" d="M14 0v14H0" />

      {/* readouts */}
      <div className="absolute left-5 bottom-5 flex items-center gap-2 ps-5 text-[10px] meta text-ash/70">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500/80 animate-pulse" />
        REC
      </div>
      <div className="absolute right-5 bottom-5 pe-5 meta text-[10px] text-ash/70">
        IURY · ƒ/1.4 · 24fps
      </div>
    </div>
  );
}

function Bracket({ className, d }: { className: string; d: string }) {
  return (
    <svg
      className={`absolute ${className} text-ash/50`}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path d={d} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
