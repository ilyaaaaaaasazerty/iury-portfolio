import { bladePaths } from "@/lib/aperture";

interface Props {
  size?: number;
  className?: string;
  title?: string;
}

/** The IURY mark: a swirled aperture of blades around a watching eye. */
export default function IuryMark({ size = 40, className = "", title = "IURY" }: Props) {
  const blades = bladePaths({ ri: 11, ro: 47, span: 38, swirl: 31, count: 12 });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <g fill="currentColor" stroke="var(--color-ink)" strokeWidth="0.7">
        {blades.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {/* eye socket */}
      <circle cx="50" cy="50" r="12.2" fill="var(--color-ink)" />
      <circle cx="50" cy="50" r="12.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
      {/* iris band */}
      <circle cx="50" cy="50" r="8.6" fill="none" stroke="currentColor" strokeWidth="3.1" opacity="0.92" />
      {/* pupil */}
      <circle cx="50" cy="50" r="4.4" fill="var(--color-ink)" />
      {/* catchlight */}
      <circle cx="46.4" cy="46.4" r="1.7" fill="currentColor" />
    </svg>
  );
}

/** Mark + IURY wordmark, locked up horizontally. */
export function IuryLockup({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <IuryMark size={size} />
      <span
        className="font-sans font-extrabold leading-none"
        style={{ fontSize: size * 0.74, letterSpacing: "0.02em" }}
      >
        IURY
      </span>
    </span>
  );
}
