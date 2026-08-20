export type Granularity = 'day' | 'week' | 'month';
export type Channel = 'email' | 'mobile' | 'wpp';

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

export interface TimeseriesMeta {
  from: string;
  to: string;
  granularity: Granularity;
  channels: Channel[];
  conversionStatuses: number[];
  queryMs: number;
  cached: boolean;
  source: string;
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

export const STATUS_LABELS: Record<number, string> = {
  1: 'Válido',
  2: 'Inválido',
  3: 'Incompleto',
  4: 'Pendente',
  5: 'Aberto',
  6: 'Visualizou',
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: 'E-mail',
  mobile: 'Mobile',
  wpp: 'WhatsApp',
};
