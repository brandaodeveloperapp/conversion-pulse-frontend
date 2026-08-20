import type { Channel, Granularity } from './types';

const GRANULARITIES: Granularity[] = ['day', 'week', 'month'];
const CHANNELS: Channel[] = ['email', 'mobile', 'wpp'];

export interface DashboardFilters {
  granularity: Granularity;
  channels: Channel[];
  conversionStatuses: number[];
  from?: string;
  to?: string;
}

function csv<T extends string>(value: string | undefined, allowed: T[]): T[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry): entry is T => (allowed as string[]).includes(entry));
}

function statusList(value: string | undefined): number[] {
  if (!value) return [1];
  const parsed = value
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry) && entry >= 1 && entry <= 6);
  return parsed.length > 0 ? parsed : [1];
}

/**
 * Reads the dashboard state out of the URL. Filters live in searchParams so a
 * shared link reproduces the exact view, and the server component re-fetches on
 * navigation — no client-side call, so the API's locked CORS never gets in the
 * way.
 */
export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): DashboardFilters {
  const one = (key: string): string | undefined => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const granularity = GRANULARITIES.includes(one('granularity') as Granularity)
    ? (one('granularity') as Granularity)
    : 'month';

  return {
    granularity,
    channels: csv(one('channels'), CHANNELS),
    conversionStatuses: statusList(one('conversionStatuses')),
    from: one('from'),
    to: one('to'),
  };
}

export function filtersToQuery(filters: DashboardFilters): string {
  const query = new URLSearchParams();
  query.set('granularity', filters.granularity);
  if (filters.channels.length > 0) {
    query.set('channels', filters.channels.join(','));
  }
  query.set('conversionStatuses', filters.conversionStatuses.join(','));
  if (filters.from) query.set('from', filters.from);
  if (filters.to) query.set('to', filters.to);
  return query.toString();
}
