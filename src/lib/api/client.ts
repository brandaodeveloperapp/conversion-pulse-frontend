import 'server-only';
import { filtersToQuery, type DashboardFilters } from './filters';
import type { ChannelVolume, TimeseriesResponse } from './types';

const BASE_URL =
  process.env.API_BASE_URL ??
  'https://conversion-pulse.brandaodeveloper.com.br';

const REVALIDATE_SECONDS = 60;

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    throw new ApiError(`GET ${path} failed`, response.status);
  }
  return response.json() as Promise<T>;
}

export function fetchTimeseries(
  filters: DashboardFilters,
): Promise<TimeseriesResponse> {
  return getJson<TimeseriesResponse>(
    `/api/v1/conversion/timeseries?${filtersToQuery(filters)}`,
  );
}

export function fetchChannels(): Promise<ChannelVolume[]> {
  return getJson<ChannelVolume[]>('/api/v1/conversion/channels');
}

export { ApiError };
