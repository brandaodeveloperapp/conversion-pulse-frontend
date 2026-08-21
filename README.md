# Conversion Pulse — Dashboard

Frontend do desafio Tech Lead da Ilumeo. Dashboard da evolução temporal da taxa
de conversão por canal, consumindo a
[API](https://conversion-pulse.brandaodeveloper.com.br) que serve o rollup sobre
9,5M de envios.

Backend: [`conversion-pulse-backend`](https://github.com/brandaodeveloperapp/conversion-pulse-backend).

## Decisão central: busca no servidor

Next.js App Router com **Server Components**. Os filtros vivem na URL
(`searchParams`); ao mudar um filtro, o servidor re-busca e re-renderiza — o
browser nunca chama a API direto.

Isso não é detalhe de implementação, é o que encaixa na decisão de segurança do
backend: a API tem **CORS trancado** (nega qualquer origem), justamente porque
um dashboard não precisa de CORS quando busca do lado servidor. E como cada
recorte é uma URL, um link compartilhado reproduz a visão exata.

Em produção o server component busca pelo Service interno do cluster
(`http://cpulse-api.conversion-pulse.svc.cluster.local`) — sem TLS, sem CORS,
sem sair da rede do k3s.

## O que a UI mostra

- **Linha por canal** da taxa de conversão ao longo do tempo. Um dia sem envio
  **corta a linha**, não cai a zero — reflete o `null` que a API devolve para
  denominador zero.
- **KPIs**: envios, conversões, taxa global e o tempo da consulta (com selo de
  cache/rollup). Com um período selecionado, cada KPI mostra a **variação vs o
  período anterior** de mesmo tamanho (▲ verde / ▼ vermelho).
- **Tabela** com envios, conversões e entregues ao lado da taxa em cada linha —
  porque a taxa sozinha esconde que o wpp manda milhares contra milhões do
  email; 100% sobre dois envios não é vitória. **Paginada** (50/página),
  **ordenável por qualquer coluna** (a ordenação vale sobre a série inteira, não
  só a página) e com **export CSV** do recorte completo. No mobile a tabela vira
  cards empilhados — sem scroll horizontal.
- **Por canal**: um card por canal, ordenado por volume; clicar abre a tabela
  filtrada naquele canal.
- **Comparação**: dois recortes de status lado a lado, com a **diferença A−B em
  pontos percentuais** e os dois gráficos na **mesma escala Y** — comparação
  honesta, não de olho.

## Filtros

Granularidade (dia/semana/mês), canais, o que conta como conversão (status) e
período. O status 3 (Incompleto) não aparece: não existe nos dados. Cada filtro
vive na URL; ao mudar, o servidor re-busca e o conteúdo anterior fica visível
(escurecido) durante a revalidação — sem flash de loading, sem store client.

## Rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

Aponta para a API pública por padrão. Para outra origem:

```bash
API_BASE_URL=http://localhost:3000 npm run dev
```

## Qualidade

```bash
npm test             # 16 testes (parse de filtros, pivô, formatação)
npm run build        # build de produção (output standalone)
```

## Stack

Next.js 16 · React 19 · TypeScript strict · Recharts · Tailwind · Docker
(standalone) · k3s. Deploy pelo mesmo pipeline do backend: build da imagem,
`docker save` por SSH, import no containerd, `kubectl apply`.
