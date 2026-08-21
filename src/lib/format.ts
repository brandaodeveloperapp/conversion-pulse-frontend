import type { Channel, SeriesPoint } from './api/types';

const percentFmtCache = new Map<string, Intl.NumberFormat>();
const intFmtCache = new Map<string, Intl.NumberFormat>();
const dateFmtCache = new Map<string, Intl.DateTimeFormat>();

function percentFmt(locale: string): Intl.NumberFormat {
  let fmt = percentFmtCache.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    percentFmtCache.set(locale, fmt);
  }
  return fmt;
}

function intFmt(locale: string): Intl.NumberFormat {
  let fmt = intFmtCache.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale);
    intFmtCache.set(locale, fmt);
  }
  return fmt;
}

function dateFmt(locale: string): Intl.DateTimeFormat {
  let fmt = dateFmtCache.get(locale);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
    dateFmtCache.set(locale, fmt);
  }
  return fmt;
}

export function asPercent(rate: number | null, locale = 'pt-BR'): string {
  return rate === null ? '—' : percentFmt(locale).format(rate);
}

export function asInt(value: number, locale = 'pt-BR'): string {
  return intFmt(locale).format(value);
}

export function asSignedInt(value: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, { signDisplay: 'exceptZero' }).format(value);
}

export function asDate(iso: string, locale = 'pt-BR'): string {
  const [year, month, day] = iso.split('-');
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return dateFmt(locale).format(date);
}

export interface PivotRow {
  period: string;
  email: number | null;
  mobile: number | null;
  wpp: number | null;
}

/**
 * The API returns one row per (period, channel). Recharts wants one row per
 * period with a column per channel. A missing (period, channel) pair stays
 * null rather than 0 — a channel that sent nothing on a day has no rate, and
 * the chart draws a gap instead of a false dip to zero.
 */
export function pivotByPeriod(series: SeriesPoint[]): PivotRow[] {
  const byPeriod = new Map<string, PivotRow>();
  for (const point of series) {
    const row =
      byPeriod.get(point.period) ??
      ({ period: point.period, email: null, mobile: null, wpp: null } as PivotRow);
    row[point.channel] = point.conversionRate;
    byPeriod.set(point.period, row);
  }
  return [...byPeriod.values()].sort((a, b) =>
    a.period.localeCompare(b.period),
  );
}

/**
 * Single source of truth for channel colors. Recharts binds these directly to
 * the SVG `stroke`/`fill` attributes, where `var(--color-chart-*)` does not
 * resolve — so they live here as hex, not in the CSS token layer.
 */
export const CHANNEL_COLORS: Record<Channel, string> = {
  email: '#f28b04',
  mobile: '#cc3366',
  wpp: '#2dd4bf',
};

/**
 * Difference between two rates expressed in percentage points, signed. Comparing
 * two conversion rates by eye is what /compare used to force; this states it.
 */
export function asPointsDelta(
  a: number | null,
  b: number | null,
  locale = 'pt-BR',
): string {
  if (a === null || b === null) return '—';
  const points = (a - b) * 100;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(points);
  return `${formatted} pp`;
}

/** Highest non-null rate across pivot rows — used to lock a shared Y axis so
 * two charts are visually comparable. Returns null when there is nothing to plot. */
export function maxPivotRate(rows: readonly PivotRow[]): number | null {
  let max: number | null = null;
  for (const row of rows) {
    for (const channel of ['email', 'mobile', 'wpp'] as const) {
      const value = row[channel];
      if (value !== null && (max === null || value > max)) max = value;
    }
  }
  return max;
}
