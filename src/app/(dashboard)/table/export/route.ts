import type { NextRequest } from 'next/server';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';
import type { SeriesPoint } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

const HEADER = [
  'period',
  'channel',
  'sent',
  'converted',
  'delivered',
  'opened',
  'viewed',
  'conversionRate',
  'openRate',
] as const;

function csvCell(value: string | number | null): string {
  if (value === null) return '';
  let s = String(value);
  // Defense-in-depth against spreadsheet formula injection (CWE-1236): no field
  // carries free text today, but neutralize a leading =/+/-/@/tab/CR so adding
  // one later can't silently turn a cell into a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(series: readonly SeriesPoint[]): string {
  const lines = [HEADER.join(',')];
  for (const p of series) {
    lines.push(
      [
        p.period,
        p.channel,
        p.sent,
        p.converted,
        p.delivered,
        p.opened,
        p.viewed,
        p.conversionRate,
        p.openRate,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return lines.join('\n');
}

/**
 * Streams the full slice as CSV — sorting is honored, pagination is stripped so
 * the download always holds every row, not just the page the user is viewing.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = parseFilters(params);
  const filters = { ...parsed, page: undefined, pageSize: undefined };

  let data;
  try {
    data = await fetchTimeseries(filters);
  } catch (error) {
    // Mirror a 4xx from the API (e.g. a malformed date range in a shared export
    // link) instead of masking every failure as a 502 upstream error.
    const status = error instanceof ApiError ? error.status : 502;
    return new Response('failed to build export', { status });
  }

  const stamp = `${data.meta.from}_${data.meta.to}_${data.meta.granularity}`;
  return new Response(toCsv(data.series), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="conversion-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
