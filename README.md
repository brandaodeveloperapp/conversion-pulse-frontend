# Conversion Pulse — Dashboard

Frontend do desafio Tech Lead da Ilumeo. Dashboard da evolução temporal da taxa
de conversão por canal, consumindo a
[API](https://conversion-pulse.brandaodeveloper.com.br) que serve o rollup sobre
**9,5M de envios**.

[![CI](https://github.com/brandaodeveloperapp/conversion-pulse-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/brandaodeveloperapp/conversion-pulse-frontend/actions/workflows/ci.yml)
[![CD](https://github.com/brandaodeveloperapp/conversion-pulse-frontend/actions/workflows/cd.yml/badge.svg)](https://github.com/brandaodeveloperapp/conversion-pulse-frontend/actions/workflows/cd.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![tests](https://img.shields.io/badge/tests-16%20unit%20%2B%2041%20e2e-16a765)

**No ar:** [dashboard](https://conversion-pulse-app.brandaodeveloper.com.br)
· Backend: [`conversion-pulse-backend`](https://github.com/brandaodeveloperapp/conversion-pulse-backend)

## Índice

1. [Decisão central: busca no servidor](#decisão-central-busca-no-servidor)
2. [O que a UI mostra](#o-que-a-ui-mostra) — as 5 telas
3. [Filtros](#filtros)
4. [Rodar](#rodar) · [Qualidade](#qualidade) · [Stack](#stack)

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
npm test             # 16 unit (parse de filtros, pivô, formatação)
npm run test:e2e     # 41 e2e Playwright (navegação, filtros, KPIs, responsivo)
npm run build        # build de produção (output standalone)
npm run lint         # ESLint
```

Os unit cobrem a lógica pura (`src/`). Os e2e Playwright rodam as 5 rotas em três
viewports (desktop/tablet/mobile) contra um servidor real; por padrão apontam
para a URL pública, `E2E_BASE_URL=http://localhost:3100` mira um build local.

## Stack

Next.js 16 · React 19 · TypeScript strict · Recharts · Tailwind · Docker
(standalone) · k3s.

**Deploy** — mesmo padrão sem registry do backend, com CI/CD próprio: merge em
`main` → CI (lint · testes · build · docker) → CD cross-builda a imagem, envia
por SSH, importa no containerd do k3s, aplica o overlay de produção e faz
rollout do `cpulse-web`, com smoke test e `rollout undo` em caso de falha. Chave
ed25519 dedicada a este projeto, apagada do runner ao fim de cada job.
