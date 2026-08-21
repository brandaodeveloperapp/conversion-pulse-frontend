import type { ReactNode } from 'react';

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * Pill toggle shared by every filter surface (sidebar filters, compare status
 * panels). Was duplicated verbatim in two components; extracted so the active /
 * inactive treatment lives in one place. Presentational — the caller owns the
 * click behavior.
 */
export function Chip({ active, onClick, children, ariaLabel }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-on-primary'
          : 'rounded-full border border-border-subtle px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-text-primary'
      }
    >
      {children}
    </button>
  );
}
