import { CHANNEL_LABELS, type SeriesPoint } from '@/lib/api/types';
import { asDate, asInt, asPercent } from '@/lib/format';

interface Props {
  series: SeriesPoint[];
}

/**
 * The rate alone hides that wpp sends a few thousand against millions for
 * email, so a 100% rate on two sends looks like a win. Sent and converted
 * travel next to the rate on every row for exactly that reason.
 */
export function SeriesTable({ series }: Props) {
  if (series.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <tr>
            <Th>Período</Th>
            <Th>Canal</Th>
            <Th numeric>Envios</Th>
            <Th numeric>Conversões</Th>
            <Th numeric>Entregues</Th>
            <Th numeric>Taxa</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {series.map((row) => (
            <tr key={`${row.period}-${row.channel}`}>
              <Td>{asDate(row.period)}</Td>
              <Td>{CHANNEL_LABELS[row.channel]}</Td>
              <Td numeric>{asInt(row.sent)}</Td>
              <Td numeric>{asInt(row.converted)}</Td>
              <Td numeric>{asInt(row.delivered)}</Td>
              <Td numeric>{asPercent(row.conversionRate)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  numeric,
}: {
  children: React.ReactNode;
  numeric?: boolean;
}) {
  return (
    <th
      className={
        numeric
          ? 'px-4 py-2 text-right font-medium'
          : 'px-4 py-2 font-medium'
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  numeric,
}: {
  children: React.ReactNode;
  numeric?: boolean;
}) {
  return (
    <td
      className={
        numeric
          ? 'px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300'
          : 'px-4 py-2 text-slate-700 dark:text-slate-300'
      }
    >
      {children}
    </td>
  );
}
