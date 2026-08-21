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
import { useLocale, useTranslations } from 'next-intl';
import { type Channel } from '@/lib/api/types';
import { asDate, asPercent, CHANNEL_COLORS, type PivotRow } from '@/lib/format';

interface Props {
  data: PivotRow[];
  channels: Channel[];
  /** Lock the Y axis to a shared range so two charts compare honestly. */
  yDomain?: [number, number];
}

const percentAxis = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

export function ConversionChart({ data, channels, yDomain }: Props) {
  const locale = useLocale();
  const tChannels = useTranslations('channels');
  const tChart = useTranslations('chart');

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-dashed border-border-subtle text-text-muted">
        {tChart('empty')}
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
            tickFormatter={(value: string) => asDate(value, locale)}
            tick={{ fontSize: 12 }}
            stroke="#69727d"
          />
          <YAxis
            tickFormatter={percentAxis}
            tick={{ fontSize: 12 }}
            stroke="#69727d"
            width={56}
            domain={yDomain ?? [0, 'auto']}
            allowDataOverflow={yDomain !== undefined}
          />
          <Tooltip
            formatter={(value, name) => [
              asPercent(typeof value === 'number' ? value : null, locale),
              tChannels(name as Channel) ?? String(name),
            ]}
            labelFormatter={(label) => asDate(String(label), locale)}
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
            formatter={(value: string) => tChannels(value as Channel) ?? value}
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
