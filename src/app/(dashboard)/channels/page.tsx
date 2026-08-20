import { Suspense } from 'react';
import { ChannelMiniChart } from '@/components/channel-mini-chart';
import { EmptyPanel, ErrorPanel, LoadingPanel, PageHeader } from '@/components/panels';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';
import { CHANNEL_LABELS, type Channel, type SeriesPoint } from '@/lib/api/types';
import { asInt, asPercent, CHANNEL_COLORS } from '@/lib/format';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  return (
    <>
      <PageHeader
        title="Por canal"
        subtitle="Cada canal no próprio eixo. Num eixo compartilhado, os milhares do wpp somem sob os milhões do e-mail."
      />
      <Suspense key={JSON.stringify(filters)} fallback={<LoadingPanel />}>
        <Content filters={filters} />
      </Suspense>
    </>
  );
}

function summarise(series: SeriesPoint[]) {
  const sent = series.reduce((acc, p) => acc + p.sent, 0);
  const converted = series.reduce((acc, p) => acc + p.converted, 0);
  const rate = sent === 0 ? null : Number((converted / sent).toFixed(6));
  return { sent, converted, rate };
}

async function Content({ filters }: { filters: ReturnType<typeof parseFilters> }) {
  let data;
  try {
    data = await fetchTimeseries(filters);
  } catch (error) {
    return <ErrorPanel status={error instanceof ApiError ? error.status : 0} />;
  }
  const channels: Channel[] =
    filters.channels.length > 0 ? filters.channels : data.meta.channels;
  if (channels.length === 0) {
    return <EmptyPanel message="Nenhum canal no recorte." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {channels.map((channel) => {
        const rows = data.series
          .filter((p) => p.channel === channel)
          .sort((a, b) => a.period.localeCompare(b.period));
        const points = rows.map((p) => ({ period: p.period, rate: p.conversionRate }));
        const totals = summarise(rows);
        const color = CHANNEL_COLORS[channel];
        return (
          <article
            key={channel}
            className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface p-5 shadow-sm"
          >
            <header className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h2 className="font-display text-sm font-semibold text-text-primary">
                {CHANNEL_LABELS[channel]}
              </h2>
            </header>
            <ChannelMiniChart data={points} color={color} gradientId={`grad-${channel}`} />
            <dl className="grid grid-cols-3 gap-2">
              <Kpi label="Envios" value={asInt(totals.sent)} />
              <Kpi label="Conversões" value={asInt(totals.converted)} />
              <Kpi label="Taxa" value={asPercent(totals.rate)} accent />
            </dl>
          </article>
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
