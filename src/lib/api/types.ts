export type Granularity = 'day' | 'week' | 'month';
export type Channel = 'email' | 'mobile' | 'wpp';
export type SortField =
  | 'period'
  | 'channel'
  | 'sent'
  | 'converted'
  | 'delivered'
  | 'rate';
export type SortDir = 'asc' | 'desc';

export interface SeriesPoint {
  period: string;
  channel: Channel;
  sent: number;
  converted: number;
  delivered: number;
  opened: number;
  viewed: number;
  conversionRate: number | null;
  openRate: number | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface TimeseriesMeta {
  from: string;
  to: string;
  granularity: Granularity;
  channels: Channel[];
  conversionStatuses: number[];
  queryMs: number;
  cached: boolean;
  source: string;
  /** Present only when the request sent a pageSize. */
  pagination?: Pagination;
}

export interface TimeseriesTotals {
  sent: number;
  converted: number;
  delivered: number;
  conversionRate: number | null;
}

export interface TimeseriesResponse {
  meta: TimeseriesMeta;
  totals: TimeseriesTotals;
  series: SeriesPoint[];
}

export interface ChannelVolume {
  channel: Channel;
  sent: number;
  firstDay: string;
  lastDay: string;
}
