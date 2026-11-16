// Hand-drawn line icon set: 24px grid, 1.75 round strokes, brush-like terminals.
const P: Record<string, JSX.Element> = {
  home: (
    <>
      <path d="M2.5 10.5 12 4l9.5 6.5" />
      <path d="M4 9.2c2.2-.6 3.6-.6 4 0M20 9.2c-2.2-.6-3.6-.6-4 0" />
      <path d="M5.5 10v9.5h13V10" />
      <path d="M10 19.5v-5h4v5" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10 5 7 4.6 3.5 5v13.5c3.5-.4 6.5 0 8.5 1.5 2-1.5 5-1.9 8.5-1.5V5C17 4.6 14 5 12 6.5Z" />
      <path d="M12 6.5V20" />
    </>
  ),
  enso: (
    <>
      <path d="M17.8 6.2A8 8 0 1 0 20 12" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  cycle: (
    <>
      <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1" />
      <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1" />
      <path d="M17.8 3.5v3.6h-3.6M6.2 20.5v-3.6h3.6" />
    </>
  ),
  twins: (
    <>
      <rect x="3.5" y="5.5" width="10" height="10" rx="1.5" />
      <rect x="10.5" y="8.5" width="10" height="10" rx="1.5" />
    </>
  ),
  wave: (
    <>
      <path d="M3 12h1.5M7 8v8M10.5 5v14M14 9v6M17.5 7v10M21 12h-1" />
    </>
  ),
  speaker: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  slow: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M12 16 7.5 11.5" />
      <path d="M6.5 16H4M20 16h-2.5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M9 20.5h6" />
    </>
  ),
  brush: (
    <>
      <path d="M20 4c-3.5 1.5-7.5 5.5-9.5 8.5l1 1C14.5 11.5 18.5 7.5 20 4Z" />
      <path d="M10.5 12.5c-2 0-3.5 1.3-3.5 3.5 0 1.7-1.3 3-3 3.5 3.5.8 7.5-.5 7.5-4.5" />
    </>
  ),
  picture: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="m3.5 16 5-5 4 4 2.5-2.5 5.5 5" />
      <circle cx="15.5" cy="9" r="1.5" />
    </>
  ),
  flame: (
    <>
      <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.2 3.6-8.3.9 1.7 1.6 2.6 2.7 3.1C12.3 7 13.3 4.7 15.4 3c-.3 3.4 3.1 5.6 3.1 11.3 0 3.9-2.6 6.7-6.5 6.7Z" />
      <path d="M12 21c-1.6 0-2.7-1.1-2.7-2.7 0-1.9 1.7-2.5 2.2-4.3 1.4 1 3.2 2.5 3.2 4.3 0 1.6-1.1 2.7-2.7 2.7Z" />
    </>
  ),
  blossom: (
    <>
      <path d="M12 9.5c-1.4-2.2-1.3-4.5 0-6 1.3 1.5 1.4 3.8 0 6Z" />
      <path d="M14.4 11.2c2.5-.9 4.7-.2 5.7 1.5-1.8.8-4 .5-5.7-1.5Z" />
      <path d="M13.5 14c1.4 2.2 1.2 4.6-.4 5.9-1-1.7-1.1-4 .4-5.9Z" />
      <path d="M10.5 14c-1.5 1.9-3.8 2.6-5.6 1.7 1-1.8 3.2-2.4 5.6-1.7Z" />
      <path d="M9.6 11.2C7.4 9.8 6.7 7.5 7.6 5.8c1.7.9 2.6 3 2 5.4Z" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  cross: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  left: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  right: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  replay: (
    <>
      <path d="M5 12a7 7 0 1 0 2.1-5" />
      <path d="M6.8 3.5v3.7h3.7" />
    </>
  ),
  play: <path d="M8 5.5v13l10-6.5z" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  eraser: (
    <>
      <path d="m14 4.5 5.5 5.5-8.5 8.5H6.5L4 16l10-11.5Z" />
      <path d="m9 9.5 5.5 5.5M11 18.5h8.5" />
    </>
  ),
  download: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  upload: <path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M5 19.5h14" />,
  reset: (
    <>
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 20.5V11" />
      <path d="M12 12c0-3.6-2.6-6-6.5-6 0 3.6 2.6 6 6.5 6Z" />
      <path d="M12 14.5c0-3.1 2.2-5.3 5.8-5.3 0 3.1-2.2 5.3-5.8 5.3Z" />
      <path d="M7.5 20.5h9" />
    </>
  ),
  lips: (
    <>
      <path d="M3 12c2-3 4.2-4.5 6-4.5 1.2 0 2 .7 3 .7s1.8-.7 3-.7c1.8 0 4 1.5 6 4.5-2.5 3.2-5.5 4.8-9 4.8S5.5 15.2 3 12Z" />
      <path d="M3 12h18" />
    </>
  ),
  pencil: (
    <>
      <path d="m15.5 4.5 4 4L9 19H5v-4z" />
      <path d="m13 7 4 4" />
    </>
  ),
  words: (
    <>
      <path d="M4 5.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3H4A1.5 1.5 0 0 1 2.5 14V7A1.5 1.5 0 0 1 4 5.5Z" />
      <path d="M19 9.5h1A1.5 1.5 0 0 1 21.5 11v6A1.5 1.5 0 0 1 20 18.5h-1v2.5l-3.5-2.5H12" />
      <path d="M6.5 9h6M6.5 12h4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r=".8" />
    </>
  ),
}

export type IconName = keyof typeof P

export default function Icon({ name, size = 20, className = '', label }: { name: IconName; size?: number; className?: string; label?: string }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {P[name]}
    </svg>
  )
}

// A red hanko-style seal stamped with the mnemonic keyword.
export function Seal({ text, size = 'm' }: { text: string; size?: 's' | 'm' | 'l' }) {
  return (
    <span className={`seal seal-${size}`} aria-label={`Picture word: ${text}`}>
      <span>{text}</span>
    </span>
  )
}
