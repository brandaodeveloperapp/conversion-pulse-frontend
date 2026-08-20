import { describe, expect, it } from 'vitest';
import { filtersToQuery, parseFilters } from './filters';

describe('parseFilters', () => {
  it('defaults to a monthly view of status 1 across all channels', () => {
    const f = parseFilters({});
    expect(f.granularity).toBe('month');
    expect(f.channels).toEqual([]);
    expect(f.conversionStatuses).toEqual([1]);
    expect(f.from).toBeUndefined();
  });

  it('keeps only valid channels and drops junk', () => {
    expect(parseFilters({ channels: 'email,lixo,wpp' }).channels).toEqual([
      'email',
      'wpp',
    ]);
  });

  it('falls back to status 1 when every status is out of range', () => {
    expect(parseFilters({ conversionStatuses: '0,7,9' }).conversionStatuses).toEqual([
      1,
    ]);
  });

  it('accepts a valid granularity and rejects an invalid one', () => {
    expect(parseFilters({ granularity: 'week' }).granularity).toBe('week');
    expect(parseFilters({ granularity: 'decade' }).granularity).toBe('month');
  });

  it('takes the first value when a param arrives repeated', () => {
    expect(parseFilters({ granularity: ['day', 'week'] }).granularity).toBe(
      'day',
    );
  });
});

describe('filtersToQuery', () => {
  it('omits channels when none are selected but always pins statuses', () => {
    const q = new URLSearchParams(
      filtersToQuery({
        granularity: 'month',
        channels: [],
        conversionStatuses: [1, 5],
      }),
    );
    expect(q.get('channels')).toBeNull();
    expect(q.get('conversionStatuses')).toBe('1,5');
    expect(q.get('granularity')).toBe('month');
  });

  it('round-trips through parseFilters', () => {
    const original = {
      granularity: 'day' as const,
      channels: ['email' as const, 'mobile' as const],
      conversionStatuses: [1, 2],
      from: '2024-03-01',
      to: '2024-03-31',
    };
    const parsed = parseFilters(
      Object.fromEntries(new URLSearchParams(filtersToQuery(original))),
    );
    expect(parsed).toEqual(original);
  });
});
