import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/panels';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about');
  return { title: t('documentTitle') };
}

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <div className="flex flex-col gap-4">
        <Note title={t('notes.scale.title')}>{t('notes.scale.body')}</Note>
        <Note title={t('notes.nullRate.title')}>
          {t.rich('notes.nullRate.body', {
            code: (chunks) => <code className="text-primary">{chunks}</code>,
          })}
        </Note>
        <Note title={t('notes.rateAlone.title')}>{t('notes.rateAlone.body')}</Note>
        <Note title={t('notes.status3.title')}>{t('notes.status3.body')}</Note>
        <Note title={t('notes.createdAt.title')}>{t('notes.createdAt.body')}</Note>
      </div>
    </>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-sm">
      <h2 className="mb-1.5 font-display text-sm font-semibold text-text-primary">
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-text-secondary">{children}</p>
    </section>
  );
}
