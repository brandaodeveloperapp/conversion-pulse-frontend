import type { Channel, Granularity, SortDir, SortField } from './types';

const GRANULARITIES: Granularity[] = ['day', 'week', 'month'];
const CHANNELS: Channel[] = ['email', 'mobile', 'wpp'];
const SORT_FIELDS: SortField[] = [
  'period',
  'channel',
  'sent',
  'converted',
  'delivered',
  'rate',
];
const SORT_DIRS: SortDir[] = ['asc', 'desc'];

export interface DashboardFilters {
  granularity: Granularity;
  channels: Channel[];
  conversionStatuses: number[];
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: SortField;
  dir?: SortDir;
}

const PAGE_SIZE_MAX = 1000;

function positiveInt(value: string | undefined, max: number): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > max) return undefined;
  return n;
}

function csv<T extends string>(value: string | undefined, allowed: T[]): T[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry): entry is T => (allowed as string[]).includes(entry));
}

/** Return the value only if it is a member of `allowed`. Checks the raw string
 * against the allowlist, then narrows — no cast ahead of the membership test. */
function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  return value !== undefined && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
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

  return {
    granularity: oneOf(one('granularity'), GRANULARITIES) ?? 'month',
    channels: csv(one('channels'), CHANNELS),
    conversionStatuses: statusList(one('conversionStatuses')),
    from: one('from'),
    to: one('to'),
    page: positiveInt(one('page'), Number.MAX_SAFE_INTEGER),
    pageSize: positiveInt(one('pageSize'), PAGE_SIZE_MAX),
    sort: oneOf(one('sort'), SORT_FIELDS),
    dir: oneOf(one('dir'), SORT_DIRS),
  };
}

const DAY_MS = 86_400_000;

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * The window of equal length immediately before [from, to]. Used to show a
 * period-over-period delta. Returns null when the range is absent or invalid —
 * a full-dataset view has no "previous period" to compare against.
 */
export function previousWindow(
  from: string | undefined,
  to: string | undefined,
): { from: string; to: string } | null {
  if (!from || !to) return null;
  const f = new Date(`${from}T00:00:00Z`);
  const t = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime()) || t < f) {
    return null;
  }
  const durationDays = Math.round((t.getTime() - f.getTime()) / DAY_MS);
  const prevTo = new Date(f.getTime() - DAY_MS);
  const prevFrom = new Date(prevTo.getTime() - durationDays * DAY_MS);
  return { from: toIsoDay(prevFrom), to: toIsoDay(prevTo) };
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
  if (filters.pageSize) query.set('pageSize', String(filters.pageSize));
  if (filters.page) query.set('page', String(filters.page));
  if (filters.sort) query.set('sort', filters.sort);
  if (filters.dir) query.set('dir', filters.dir);
  return query.toString();
}
