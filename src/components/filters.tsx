'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import {
  CHANNEL_LABELS,
  STATUS_LABELS,
  type Channel,
  type Granularity,
} from '@/lib/api/types';
import { parseFilters } from '@/lib/api/filters';

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];
const CHANNELS: Channel[] = ['email', 'mobile', 'wpp'];
const STATUSES = [1, 2, 4, 5, 6];

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const props = parseFilters(Object.fromEntries(params.entries()));

  const push = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  const toggleCsv = (
    key: string,
    value: string,
    current: string[],
    minOne = false,
  ) => {
    const set = new Set(current);
    if (set.has(value)) {
      if (minOne && set.size === 1) return;
      set.delete(value);
    } else {
      set.add(value);
    }
    push((next) => {
      if (set.size === 0) next.delete(key);
      else next.set(key, [...set].join(','));
    });
  };

  return (
    <div
      aria-label="Filtros"
      data-pending={pending ? '' : undefined}
      className="flex flex-col gap-5 transition-opacity data-pending:opacity-50"
    >
      <Group label="Granularidade">
        <div className="flex overflow-hidden rounded-md border border-border-subtle">
          {GRANULARITIES.map(({ value, label }, i) => (
            <button
              key={value}
              type="button"
              aria-pressed={props.granularity === value}
              onClick={() => push((next) => next.set('granularity', value))}
              className={
                (props.granularity === value
                  ? 'bg-primary text-on-primary '
                  : 'text-text-secondary hover:bg-surface-raised ') +
                (i > 0 ? 'border-l border-border-subtle ' : '') +
                'flex-1 px-2 py-1.5 text-xs font-medium transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </Group>

      <Group
        label="Canais"
        badge={props.channels.length > 0 ? props.channels.length : undefined}
      >
        <div className="flex flex-wrap gap-1.5">
          {CHANNELS.map((channel) => (
            <Chip
              key={channel}
              active={props.channels.length === 0 || props.channels.includes(channel)}
              onClick={() => toggleCsv('channels', channel, props.channels)}
            >
              {CHANNEL_LABELS[channel]}
            </Chip>
          ))}
        </div>
      </Group>

      <Group
        label="Conta como conversão"
        badge={props.conversionStatuses.length}
      >
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((status) => (
            <Chip
              key={status}
              active={props.conversionStatuses.includes(status)}
              onClick={() =>
                toggleCsv(
                  'conversionStatuses',
                  String(status),
                  props.conversionStatuses.map(String),
                  true,
                )
              }
            >
              {STATUS_LABELS[status]}
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Período">
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="De"
            defaultValue={props.from ?? ''}
            onChange={(e) =>
              push((next) => {
                if (e.target.value) next.set('from', e.target.value);
                else next.delete('from');
              })
            }
            className="min-w-0 flex-1 rounded-md border border-border-subtle bg-surface-raised px-2 py-1.5 text-xs text-text-primary [color-scheme:dark]"
          />
          <span className="text-text-muted">—</span>
          <input
            type="date"
            aria-label="Até"
            defaultValue={props.to ?? ''}
            onChange={(e) =>
              push((next) => {
                if (e.target.value) next.set('to', e.target.value);
                else next.delete('to');
              })
            }
            className="min-w-0 flex-1 rounded-md border border-border-subtle bg-surface-raised px-2 py-1.5 text-xs text-text-primary [color-scheme:dark]"
          />
        </div>
      </Group>
    </div>
  );
}

function Group({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="font-display text-[0.68rem] font-semibold uppercase text-text-muted"
          style={{ letterSpacing: 'var(--tracking-nav)' }}
        >
          {label}
        </span>
        {badge !== undefined ? (
          <span className="rounded-full bg-primary-subtle px-1.5 text-[0.6rem] font-semibold text-primary">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-on-primary'
          : 'rounded-full border border-border-subtle px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-text-primary'
      }
    >
      {children}
    </button>
  );
}
