interface Props {
  size?: number;
  className?: string;
  title?: string;
}

// Aspect ratio (width / height) of the extracted aperture-eye in /public/iury-mark.png.
const MARK_RATIO = 356 / 282;

/** The IURY mark — the brand's actual aperture-eye logo. */
export default function IuryMark({ size = 40, className = "", title = "IURY" }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/iury-mark.png"
      alt={title}
      draggable={false}
      style={{ height: size, width: size * MARK_RATIO }}
      className={`inline-block max-w-none select-none object-contain ${className}`}
    />
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
