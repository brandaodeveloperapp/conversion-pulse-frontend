import { CHANNEL_LABELS, type SeriesPoint } from '@/lib/api/types';
import { asDate, asInt, asPercent } from '@/lib/format';
import { CHANNEL_COLORS } from '@/lib/format';

interface Props {
  series: SeriesPoint[];
  limit?: number;
}

/**
 * The rate alone hides that wpp sends a few thousand against millions for
 * email, so a 100% rate on two sends looks like a win. Sent and converted
 * travel next to the rate on every row for exactly that reason.
 */
export function SeriesTable({ series, limit }: Props) {
  if (series.length === 0) return null;
  const rows = limit ? series.slice(0, limit) : series;

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-raised text-left">
            <Th>Período</Th>
            <Th>Canal</Th>
            <Th numeric>Envios</Th>
            <Th numeric>Conversões</Th>
            <Th numeric>Entregues</Th>
            <Th numeric>Taxa</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.period}-${row.channel}`}
              className="border-b border-border-subtle last:border-0 hover:bg-surface-raised/50"
            >
              <Td>{asDate(row.period)}</Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CHANNEL_COLORS[row.channel] }}
                  />
                  {CHANNEL_LABELS[row.channel]}
                </span>
              </Td>
              <Td numeric>{asInt(row.sent)}</Td>
              <Td numeric>{asInt(row.converted)}</Td>
              <Td numeric>{asInt(row.delivered)}</Td>
              <Td numeric strong>{asPercent(row.conversionRate)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, numeric }: { children: React.ReactNode; numeric?: boolean }) {
  return (
    <th
      className={
        (numeric ? 'text-right ' : '') +
        'px-4 py-2.5 font-display text-[0.62rem] font-semibold uppercase text-text-muted'
      }
      style={{ letterSpacing: 'var(--tracking-nav)' }}
    >
      {children}
    </th>
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
