export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#008a94" />
          <stop offset="100%" stopColor="#007780" />
        </linearGradient>
        <linearGradient id="logoShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoBg)" />
      <rect width="32" height="32" rx="8" fill="url(#logoShine)" opacity={1} />
      <g fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22V12h2v10" />
        <path d="M13 22V8h2v14" />
        <path d="M18 22V14h2v8" />
        <path d="M23 22V10h2v12" />
      </g>
    </svg>
  );
}
