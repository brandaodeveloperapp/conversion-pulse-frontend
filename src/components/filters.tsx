'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import {
  CHANNEL_LABELS,
  STATUS_LABELS,
  type Channel,
  type Granularity,
} from '@/lib/api/types';

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];

const CHANNELS: Channel[] = ['email', 'mobile', 'wpp'];
const STATUSES = [1, 2, 4, 5, 6];

interface Props {
  granularity: Granularity;
  channels: Channel[];
  conversionStatuses: number[];
  from?: string;
  to?: string;
}

export function Filters(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

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

  const toggleCsv = (key: string, value: string, current: string[]) => {
    const set = new Set(current);
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    push((next) => {
      if (set.size === 0) {
        next.delete(key);
      } else {
        next.set(key, [...set].join(','));
      }
    });
  };

  return (
    <section
      aria-label="Filtros"
      data-pending={pending ? '' : undefined}
      className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 data-pending:opacity-60 dark:border-slate-800 dark:bg-slate-900"
    >
      <FilterGroup label="Granularidade">
        {GRANULARITIES.map(({ value, label }) => (
          <Chip
            key={value}
            active={props.granularity === value}
            onClick={() => push((next) => next.set('granularity', value))}
          >
            {label}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Canais">
        {CHANNELS.map((channel) => (
          <Chip
            key={channel}
            active={props.channels.length === 0 || props.channels.includes(channel)}
            onClick={() =>
              toggleCsv('channels', channel, props.channels)
            }
          >
            {CHANNEL_LABELS[channel]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Conta como conversão">
        {STATUSES.map((status) => (
          <Chip
            key={status}
            active={props.conversionStatuses.includes(status)}
            onClick={() =>
              toggleCsv(
                'conversionStatuses',
                String(status),
                props.conversionStatuses.map(String),
              )
            }
          >
            {STATUS_LABELS[status]}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Período">
        <input
          type="date"
          aria-label="De"
          defaultValue={props.from ?? ''}
          onChange={(event) =>
            push((next) => {
              const value = event.target.value;
              if (value) next.set('from', value);
              else next.delete('from');
            })
          }
          className="rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
        />
        <span className="text-slate-400">até</span>
        <input
          type="date"
          aria-label="Até"
          defaultValue={props.to ?? ''}
          onChange={(event) =>
            push((next) => {
              const value = event.target.value;
              if (value) next.set('to', value);
              else next.delete('to');
            })
          }
          className="rounded-md border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
        />
      </FilterGroup>
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-40 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
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
          ? 'rounded-full bg-indigo-600 px-3 py-1 text-sm font-medium text-white'
          : 'rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:text-slate-300'
      }
    >
      {children}
    </button>
  );
}
