import IuryMark from "./iury-mark";

/** Layered atmospheric depth for a section: fine grid, drifting light, ghost aperture. */
export default function Atmosphere({ flip = false }: { flip?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-blueprint-fine opacity-40" />
      <div className="light-drift absolute inset-0" />
      <IuryMark
        size={560}
        className={`absolute top-1/2 -translate-y-1/2 opacity-[0.03] ${
          flip ? "-start-40" : "-end-40"
        }`}
      />
    </div>
  );
}
