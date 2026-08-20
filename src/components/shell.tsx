'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Brand } from './brand';

export function Shell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
  const close = useCallback(() => setOpenedAt(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <div className="min-h-screen">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:block">
        {sidebar}
      </aside>

      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border-subtle bg-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpenedAt(pathname)}
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-raised"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Brand />
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Fechar menu"
            onClick={close}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-border-subtle bg-surface">
            {sidebar}
          </div>
        </div>
      ) : null}

      <main id="conteudo" className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
