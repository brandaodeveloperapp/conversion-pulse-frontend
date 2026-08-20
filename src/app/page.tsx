import { Suspense } from 'react';
import { Filters } from '@/components/filters';
import { ConversionChart } from '@/components/conversion-chart';
import { SeriesTable } from '@/components/series-table';
import { TotalsCards } from '@/components/totals-cards';
import { ApiError, fetchTimeseries } from '@/lib/api/client';
import { parseFilters } from '@/lib/api/filters';
import { CHANNEL_LABELS, type Channel } from '@/lib/api/types';
import { pivotByPeriod } from '@/lib/format';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseFilters(await searchParams);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Conversion Pulse
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Evolução temporal da taxa de conversão por canal sobre 9,5M de envios.
        </p>
      </header>

      <Filters
        granularity={filters.granularity}
        channels={filters.channels}
        conversionStatuses={filters.conversionStatuses}
        from={filters.from}
        to={filters.to}
      />

      <Suspense fallback={<LoadingPanel />} key={JSON.stringify(filters)}>
        <Dashboard filters={filters} />
      </Suspense>
    </main>
  );
}

async function Dashboard({
  filters,
}: {
  filters: ReturnType<typeof parseFilters>;
}) {
  let data;
  try {
    data = await fetchTimeseries(filters);
  } catch (error) {
    return <ErrorPanel status={error instanceof ApiError ? error.status : 0} />;
  }

  const active: Channel[] =
    filters.channels.length > 0 ? filters.channels : data.meta.channels;
  const pivot = pivotByPeriod(data.series);

  return (
    <div className="flex flex-col gap-6">
      <TotalsCards totals={data.totals} meta={data.meta} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Taxa de conversão — {active.map((c) => CHANNEL_LABELS[c]).join(', ')}
        </h2>
        <ConversionChart data={pivot} channels={active} />
        <p className="mt-3 text-xs text-slate-400">
          Um dia sem envio não tem taxa: a linha corta, não cai a zero.
        </p>
      </section>

      <SeriesTable series={data.series} />
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200 text-slate-400 dark:border-slate-800">
      Carregando…
    </div>
  );
}

function ErrorPanel({ status }: { status: number }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      <p className="font-medium">Não foi possível carregar os dados.</p>
      <p className="text-sm">
        {status === 400
          ? 'Recorte inválido — ajuste os filtros.'
          : 'A API não respondeu. Tente novamente.'}
      </p>
    </div>
  );
}
