import { Suspense } from 'react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { ChannelMiniChart } from '@/components/channel-mini-chart';
import { EmptyPanel, ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';
import { type Channel, type SeriesPoint } from '@/lib/api/types';
import { asInt, asPercent, CHANNEL_COLORS } from '@/lib/format';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const t = await getTranslations('channelsView');
  const tPanels = await getTranslations('panels');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      {/* No key: keep prior cards visible while the server re-fetches (no fallback flash). */}
      <Suspense fallback={<LoadingPanel label={tPanels('loading')} />}>
        <Content filters={filters} searchParams={raw} />
      </Suspense>
    </>
  );
}

/** Link to the full table, scoped to a single channel, keeping current filters. */
function tableHref(channel: Channel, searchParams: SearchParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || key === 'page') continue;
    params.set(key, Array.isArray(value) ? value[0] : value);
  }
  params.set('channels', channel);
  return `/table?${params.toString()}`;
}

function summarise(series: SeriesPoint[]) {
  const sent = series.reduce((acc, p) => acc + p.sent, 0);
  const converted = series.reduce((acc, p) => acc + p.converted, 0);
  const rate = sent === 0 ? null : Number((converted / sent).toFixed(6));
  return { sent, converted, rate };
}

async function Content({
  filters,
  searchParams,
}: {
  filters: ReturnType<typeof parseFilters>;
  searchParams: SearchParams;
}) {
  const t = await getTranslations('channelsView');
  const tPanels = await getTranslations('panels');
  const tChannels = await getTranslations('channels');
  const locale = await getLocale();
  let data;
  try {
    data = await fetchTimeseries(filters);
  } catch (error) {
    return (
      <ErrorPanel
        status={error instanceof ApiError ? error.status : 0}
        title={tPanels('errorTitle')}
        badRequestMessage={tPanels('errorBadRequest')}
        genericMessage={tPanels('errorGeneric')}
      />
    );
  }
  const channels: Channel[] =
    filters.channels.length > 0 ? filters.channels : data.meta.channels;
  if (channels.length === 0) {
    return <EmptyPanel message={t('empty')} />;
  }

  // Highest-volume channel first — the eye should land on the one that matters.
  const cards = channels
    .map((channel) => {
      const rows = data.series
        .filter((p) => p.channel === channel)
        .sort((a, b) => a.period.localeCompare(b.period));
      return { channel, rows, totals: summarise(rows) };
    })
    .sort((a, b) => b.totals.sent - a.totals.sent);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ channel, rows, totals }) => {
        const points = rows.map((p) => ({ period: p.period, rate: p.conversionRate }));
        const color = CHANNEL_COLORS[channel];
        return (
          <Link
            key={channel}
            href={tableHref(channel, searchParams)}
            aria-label={t('viewInTable', { channel: tChannels(channel) })}
            className="group flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
          >
            <header className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h2 className="font-display text-sm font-semibold text-text-primary">
                  {tChannels(channel)}
                </h2>
              </span>
              <span
                aria-hidden
                className="font-mono text-xs text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              >
                →
              </span>
            </header>
            <ChannelMiniChart data={points} color={color} gradientId={`grad-${channel}`} />
            <dl className="grid grid-cols-3 gap-2">
              <Kpi label={t('kpiSent')} value={asInt(totals.sent, locale)} />
              <Kpi label={t('kpiConverted')} value={asInt(totals.converted, locale)} />
              <Kpi label={t('kpiRate')} value={asPercent(totals.rate, locale)} accent />
            </dl>
          </Link>
        );
      })}
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className="font-display text-[0.58rem] font-semibold uppercase text-text-muted"
        style={{ letterSpacing: 'var(--tracking-nav)' }}
      >
        {label}
      </dt>
      <dd
        className={
          (accent ? 'text-primary ' : 'text-text-primary ') +
          'font-mono text-sm font-semibold tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  );
}
