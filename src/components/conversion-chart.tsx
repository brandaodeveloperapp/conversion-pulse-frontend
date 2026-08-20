'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHANNEL_LABELS, type Channel } from '@/lib/api/types';
import { asDate, asPercent, CHANNEL_COLORS, type PivotRow } from '@/lib/format';

interface Props {
  data: PivotRow[];
  channels: Channel[];
}

const percentAxis = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

export function ConversionChart({ data, channels }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Nenhum ponto no recorte selecionado.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
          <XAxis
            dataKey="period"
            tickFormatter={asDate}
            tick={{ fontSize: 12 }}
            stroke="#69727d"
          />
          <YAxis
            tickFormatter={percentAxis}
            tick={{ fontSize: 12 }}
            stroke="#69727d"
            width={56}
          />
          <Tooltip
            formatter={(value, name) => [
              asPercent(typeof value === 'number' ? value : null),
              CHANNEL_LABELS[name as Channel] ?? String(name),
            ]}
            labelFormatter={(label) => asDate(String(label))}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-text-secondary)' }}
          />
          <Legend
            formatter={(value: string) => CHANNEL_LABELS[value as Channel] ?? value}
          />
          {channels.map((channel) => (
            <Line
              key={channel}
              type="monotone"
              dataKey={channel}
              stroke={CHANNEL_COLORS[channel]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
