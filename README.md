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
  cache/rollup).
- **Tabela** com envios, conversões e entregues ao lado da taxa em cada linha —
  porque a taxa sozinha esconde que o wpp manda milhares contra milhões do
  email; 100% sobre dois envios não é vitória.

## Filtros

Granularidade (dia/semana/mês), canais, o que conta como conversão (status) e
período. O status 3 (Incompleto) não aparece: não existe nos dados.

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
npm test             # 13 testes (parse de filtros, pivô, formatação)
npm run build        # build de produção (output standalone)
```

## Stack

Next.js 16 · React 19 · TypeScript strict · Recharts · Tailwind · Docker
(standalone) · k3s. Deploy pelo mesmo pipeline do backend: build da imagem,
`docker save` por SSH, import no containerd, `kubectl apply`.
