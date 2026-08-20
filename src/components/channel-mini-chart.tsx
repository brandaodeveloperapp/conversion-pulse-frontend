'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import { useLocale, useTranslations } from 'next-intl';
import { asDate, asPercent } from '@/lib/format';

interface Point {
  period: string;
  rate: number | null;
}

export function ChannelMiniChart({
  data,
  color,
  gradientId,
}: {
  data: Point[];
  color: string;
  gradientId: string;
}) {
  const locale = useLocale();
  const tChart = useTranslations('chart');

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value) => [
              asPercent(typeof value === 'number' ? value : null, locale),
              tChart('tooltipRate'),
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
          <Area
            type="monotone"
            dataKey="rate"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
