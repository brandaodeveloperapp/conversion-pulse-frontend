import type { Channel, SeriesPoint } from './api/types';

const percentFmt = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intFmt = new Intl.NumberFormat('pt-BR');

export function asPercent(rate: number | null): string {
  return rate === null ? '—' : percentFmt.format(rate);
}

export function asInt(value: number): string {
  return intFmt.format(value);
}

export function asDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
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

export const CHANNEL_COLORS: Record<Channel, string> = {
  email: 'var(--color-chart-email)',
  mobile: 'var(--color-chart-mobile)',
  wpp: 'var(--color-chart-wpp)',
};
