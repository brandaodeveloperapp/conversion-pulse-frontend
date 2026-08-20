import { PageHeader } from '@/components/panels';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sobre os dados — Conversion Pulse' };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Sobre os dados"
        subtitle="O que a série mostra, e o que ela deliberadamente não esconde."
      />
      <div className="flex flex-col gap-4">
        <Note title="9,5 milhões de linhas, resposta em milissegundos">
          A rota agrega uma tabela de fatos de 9.525.993 envios. A resposta vem de
          uma view materializada (rollup dia × canal), então a mesma pergunta que
          custaria ~2s varrendo o fato sai em fração de milissegundo. O selo
          “via cache” ou “conversion_daily” nos KPIs diz de onde veio.
        </Note>
        <Note title="Um dia sem envio não tem taxa — não é zero">
          Divisão por zero devolve <code className="text-primary">null</code>, não
          0. No gráfico a linha corta; um zero falso pareceria uma queda de
          desempenho que nunca existiu.
        </Note>
        <Note title="A taxa sozinha mente sobre o wpp">
          O e-mail manda milhões, o wpp manda milhares. Uma taxa de 100% sobre dois
          envios não é vitória. Por isso envios e conversões viajam ao lado da taxa
          em toda linha, e a view “Por canal” dá a cada canal o próprio eixo.
        </Note>
        <Note title="O status 3 (Incompleto) não existe nos dados">
          O enunciado lista seis status; o dump usa cinco. Por isso ele não aparece
          entre os filtros de conversão.
        </Note>
        <Note title="O campo created_at é sintético e determinístico">
          O dump não tem coluna temporal. O created_at é gerado pela posição
          ordinal do id através de uma curva de sazonalidade — sem random, o mesmo
          dump gera sempre as mesmas datas.
        </Note>
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
