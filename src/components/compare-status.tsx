'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Chip } from '@/components/ui/chip';

const STATUSES = [1, 2, 4, 5, 6];

type StatusKey = '1' | '2' | '3' | '4' | '5' | '6';

function statusKey(status: number): StatusKey {
  return String(status) as StatusKey;
}

export function CompareStatus({
  paramKey,
  selected,
}: {
  paramKey: string;
  selected: number[];
}) {
  const tStatus = useTranslations('status');
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
        <Chip
          key={status}
          active={selected.includes(status)}
          onClick={() => toggle(status)}
        >
          {tStatus(statusKey(status))}
        </Chip>
      ))}
    </div>
  );
}
