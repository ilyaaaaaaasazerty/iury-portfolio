interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function base(size = 18, strokeWidth = 1.5, className = "") {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

export function IconArrow({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function IconMenu({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M3 7h18M3 17h18" />
    </svg>
  );
}

export function IconClose({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconGithub({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 4.8 4.9 4.9 0 0 0 18.9 1S17.7.6 15 2.5a13.4 13.4 0 0 0-7 0C5.3.6 4.1 1 4.1 1A4.9 4.9 0 0 0 4 4.8 5.2 5.2 0 0 0 2.6 8.4c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
    </svg>
  );
}

export function IconMail({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6 9 6 9-6" />
    </svg>
  );
}

export function IconExternal({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M15 3h6v6M21 3l-9 9M10 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4" />
    </svg>
  );
}

export function IconPlus({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconChevron({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconTrash({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

export function IconDrag({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </svg>
  );
}
