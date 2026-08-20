import { describe, expect, it } from 'vitest';
import type { SeriesPoint } from './api/types';
import { asDate, asInt, asPercent, pivotByPeriod } from './format';

function point(partial: Partial<SeriesPoint>): SeriesPoint {
  return {
    period: '2024-01-01',
    channel: 'email',
    sent: 0,
    converted: 0,
    delivered: 0,
    opened: 0,
    viewed: 0,
    conversionRate: null,
    openRate: null,
    ...partial,
  };
}

describe('asPercent', () => {
  it('renders a dash for a null rate rather than a fake zero', () => {
    expect(asPercent(null)).toBe('—');
  });

  it('formats a rate as a two-decimal percentage', () => {
    expect(asPercent(0.002988)).toBe('0,30%');
  });
});

describe('asInt / asDate', () => {
  it('groups thousands and reorders the ISO date', () => {
    expect(asInt(9525993)).toBe('9.525.993');
    expect(asDate('2024-03-31')).toBe('31/03/2024');
  });
});

describe('locale-aware formatting', () => {
  it('formats pt-BR with dot thousands, comma decimals and dd/mm/yyyy', () => {
    expect(asInt(9525993, 'pt-BR')).toBe('9.525.993');
    expect(asPercent(0.002988, 'pt-BR')).toBe('0,30%');
    expect(asDate('2024-03-31', 'pt-BR')).toBe('31/03/2024');
  });

  it('formats en with comma thousands, dot decimals and mm/dd/yyyy', () => {
    expect(asInt(9525993, 'en')).toBe('9,525,993');
    expect(asPercent(0.002988, 'en')).toBe('0.30%');
    expect(asDate('2024-03-31', 'en')).toBe('03/31/2024');
  });

  it('keeps the null-rate dash independent of locale', () => {
    expect(asPercent(null, 'en')).toBe('—');
  });
});

describe('pivotByPeriod', () => {
  it('collapses per-channel rows into one row per period', () => {
    const rows = pivotByPeriod([
      point({ period: '2024-01-01', channel: 'email', conversionRate: 0.01 }),
      point({ period: '2024-01-01', channel: 'wpp', conversionRate: 0.5 }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: 0.01, wpp: 0.5, mobile: null });
  });

  it('keeps a missing channel as null, never zero', () => {
    const rows = pivotByPeriod([
      point({ period: '2024-02-01', channel: 'email', conversionRate: 0.02 }),
    ]);
    expect(rows[0].mobile).toBeNull();
    expect(rows[0].wpp).toBeNull();
  });

  it('sorts periods chronologically', () => {
    const rows = pivotByPeriod([
      point({ period: '2024-03-01' }),
      point({ period: '2024-01-01' }),
      point({ period: '2024-02-01' }),
    ]);
    expect(rows.map((r) => r.period)).toEqual([
      '2024-01-01',
      '2024-02-01',
      '2024-03-01',
    ]);
  });
});
