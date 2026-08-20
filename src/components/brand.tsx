export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <g stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="20" y2="6" />
          <line x1="3" y1="13" x2="14" y2="13" />
          <line x1="3" y1="20" x2="23" y2="20" />
        </g>
      </svg>
      {!compact ? (
        <div className="flex flex-col leading-none">
          <span
            className="font-display text-sm font-semibold text-text-primary"
            style={{ letterSpacing: '0.18em' }}
          >
            CONVERSION
          </span>
          <span
            className="font-display text-[0.7rem] font-medium text-primary"
            style={{ letterSpacing: '0.32em' }}
          >
            PULSE
          </span>
        </div>
      ) : null}
    </div>
  );
}
