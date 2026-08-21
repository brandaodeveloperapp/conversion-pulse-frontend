import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { SeriesPoint, SortDir, SortField } from '@/lib/api/types';
import { asDate, asInt, asPercent, CHANNEL_COLORS } from '@/lib/format';

type SearchParams = Record<string, string | string[] | undefined>;

interface SortControl {
  field?: SortField;
  dir?: SortDir;
  basePath: string;
  searchParams: SearchParams;
}

interface Props {
  series: SeriesPoint[];
  limit?: number;
  /** When provided, column headers become sort links. Omit for a static table. */
  sort?: SortControl;
}

const COLUMNS: ReadonlyArray<{ field: SortField; numeric: boolean }> = [
  { field: 'period', numeric: false },
  { field: 'channel', numeric: false },
  { field: 'sent', numeric: true },
  { field: 'converted', numeric: true },
  { field: 'delivered', numeric: true },
  { field: 'rate', numeric: true },
];

/**
 * The rate alone hides that wpp sends a few thousand against millions for
 * email, so a 100% rate on two sends looks like a win. Sent and converted
 * travel next to the rate on every row for exactly that reason.
 *
 * Two layouts, one data set: stacked cards below `md`, the full table from `md`
 * up. Headers sort server-side when a `sort` control is passed. rem only.
 */
export async function SeriesTable({ series, limit, sort }: Props) {
  if (series.length === 0) return null;
  const rows = limit ? series.slice(0, limit) : series;
  const t = await getTranslations('seriesTable');
  const tChannels = await getTranslations('channels');
  const locale = await getLocale();

  const label: Record<SortField, string> = {
    period: t('period'),
    channel: t('channel'),
    sent: t('sent'),
    converted: t('converted'),
    delivered: t('delivered'),
    rate: t('rate'),
  };

  return (
    <>
      {/* Mobile: one card per row — no horizontal scroll, every field visible */}
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <li
            key={`card-${row.period}-${row.channel}`}
            className="rounded-lg border border-border-subtle bg-surface p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <ChannelTag label={tChannels(row.channel)} channel={row.channel} />
              <time className="font-mono text-xs tabular-nums text-text-muted">
                {asDate(row.period, locale)}
              </time>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Field label={label.sent} value={asInt(row.sent, locale)} />
              <Field label={label.converted} value={asInt(row.converted, locale)} />
              <Field label={label.delivered} value={asInt(row.delivered, locale)} />
              <Field label={label.rate} value={asPercent(row.conversionRate, locale)} strong />
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop: full table, wide content scrolls inside its own container */}
      <div className="hidden overflow-x-auto rounded-lg border border-border-subtle md:block">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-raised text-left">
              {COLUMNS.map((col) => (
                <HeaderCell
                  key={col.field}
                  field={col.field}
                  label={label[col.field]}
                  numeric={col.numeric}
                  sort={sort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.period}-${row.channel}`}
                className="border-b border-border-subtle last:border-0 hover:bg-surface-raised/50"
              >
                <Td>{asDate(row.period, locale)}</Td>
                <Td>
                  <ChannelTag label={tChannels(row.channel)} channel={row.channel} />
                </Td>
                <Td numeric>{asInt(row.sent, locale)}</Td>
                <Td numeric>{asInt(row.converted, locale)}</Td>
                <Td numeric>{asInt(row.delivered, locale)}</Td>
                <Td numeric strong>
                  {asPercent(row.conversionRate, locale)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HeaderCell({
  field,
  label,
  numeric,
  sort,
}: {
  field: SortField;
  label: string;
  numeric: boolean;
  sort?: SortControl;
}) {
  const cls =
    (numeric ? 'text-right ' : '') +
    'px-4 py-2.5 font-display text-[0.62rem] font-semibold uppercase text-text-muted';
  const style = { letterSpacing: 'var(--tracking-nav)' };

  if (!sort) {
    return (
      <th className={cls} style={style}>
        {label}
      </th>
    );
  }

  const active = sort.field === field;
  const nextDir: SortDir = active && sort.dir === 'asc' ? 'desc' : 'asc';
  const ariaSort = active
    ? sort.dir === 'desc'
      ? 'descending'
      : 'ascending'
    : 'none';

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sort.searchParams)) {
    if (value === undefined || key === 'page') continue; // sorting resets to page 1
    params.set(key, Array.isArray(value) ? value[0] : value);
  }
  params.set('sort', field);
  params.set('dir', nextDir);
  const href = `${sort.basePath}?${params.toString()}`;

  const arrow = active ? (sort.dir === 'desc' ? '↓' : '↑') : '';

  return (
    <th className={cls} style={style} aria-sort={ariaSort}>
      <Link
        href={href}
        scroll={false}
        className={
          (numeric ? 'justify-end ' : '') +
          (active ? 'text-primary ' : 'hover:text-text-secondary ') +
          'inline-flex items-center gap-1 transition-colors'
        }
      >
        {label}
        <span aria-hidden className="font-mono">
          {arrow}
        </span>
      </Link>
    </th>
  );
}

function ChannelTag({
  label,
  channel,
}: {
  label: string;
  channel: SeriesPoint['channel'];
}) {
  return (
    <span className="inline-flex items-center gap-2 text-text-secondary">
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: CHANNEL_COLORS[channel] }}
      />
      {label}
    </span>
  );
}

function Field({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className="font-display text-[0.62rem] font-semibold uppercase text-text-muted"
        style={{ letterSpacing: 'var(--tracking-nav)' }}
      >
        {label}
      </dt>
      <dd
        className={
          (strong ? 'text-text-primary ' : 'text-text-secondary ') +
          'font-mono text-sm tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Td({
  children,
  numeric,
  strong,
}: {
  children: React.ReactNode;
  numeric?: boolean;
  strong?: boolean;
}) {
  return (
    <td
      className={
        (numeric ? 'text-right font-mono tabular-nums ' : '') +
        (strong ? 'text-text-primary ' : 'text-text-secondary ') +
        'px-4 py-2.5'
      }
    >
      {children}
    </td>
  );
}
