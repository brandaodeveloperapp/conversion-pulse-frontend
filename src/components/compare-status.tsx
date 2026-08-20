'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { STATUS_LABELS } from '@/lib/api/types';

const STATUSES = [1, 2, 4, 5, 6];

export function CompareStatus({
  paramKey,
  selected,
}: {
  paramKey: string;
  selected: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const toggle = (status: number) => {
    const set = new Set(selected);
    if (set.has(status)) {
      if (set.size === 1) return;
      set.delete(status);
    } else {
      set.add(status);
    }
    const next = new URLSearchParams(params.toString());
    next.set(paramKey, [...set].sort((a, b) => a - b).join(','));
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          aria-pressed={selected.includes(status)}
          onClick={() => toggle(status)}
          className={
            selected.includes(status)
              ? 'rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-on-primary'
              : 'rounded-full border border-border-subtle px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-text-primary'
          }
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
