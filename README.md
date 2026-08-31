# The Reactor

Sistema operacional da clínica: comercial, financeiro, agenda, relatórios e copiloto de IA
em um lugar só — com o pipeline espelhando o Kommo em tempo real.

## O que ele faz

| Módulo | O que entrega |
|---|---|
| **Visão geral** | KPIs do funil, financeiro e agenda + leitura automática da operação |
| **Pipeline** | Quadro com as colunas reais do Kommo. Mover um card grava a etapa no CRM |
| **Financeiro** | Receita, despesa, margem, série mensal e categorias, direto do banco |
| **Agenda** | Atendimentos por dia, taxa de comparecimento e receita prevista |
| **Relatórios** | Relatório diário/semanal/mensal gerado dos dados, com resumo executivo |
| **Copiloto** | Pergunta em português sobre o funil, o caixa e a agenda |
| **Integrações** | Estado de cada conexão e o catálogo completo da API |

## Espelho do Kommo

O Reactor não inventa um funil próprio. A sincronização traz do Kommo:

- **pipelines** (`reactor_pipelines`)
- **etapas com cor e ordem** (`reactor_pipeline_statuses`) — são as colunas do quadro
- **leads** com valor, responsável, contato e etapa (`reactor_leads`)

Mover um card chama `POST /api/leads/move`, que **grava no Kommo primeiro**. Se o CRM recusar,
nada muda localmente — o quadro nunca mostra uma etapa que o Kommo não tem.

## API

Todas as rotas respondem `{ ok: true, data }` ou `{ ok: false, error }`.

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/health` | Status do sistema; faz ping real no Postgres |
| GET | `/api/board` | Quadro do pipeline com as colunas do Kommo |
| POST | `/api/leads/move` | Move um lead de etapa e replica no Kommo |
| GET | `/api/leads` | Leads e métricas do funil |
| GET/POST | `/api/sync/kommo` | Status e execução do espelho |
| GET | `/api/finance/summary` | Série mensal, categorias, totais |
| GET | `/api/transactions` | Lançamentos financeiros |
| GET | `/api/appointments` | Agenda e taxa de comparecimento |
| GET | `/api/tasks` | Tarefas operacionais |
| GET/POST | `/api/ai/assist` | Contexto e respostas do copiloto |
| GET/POST | `/api/reports` | Histórico e geração de relatórios |
| POST | `/api/webhook/evolution` | Entrada de mensagens do WhatsApp |

### Relatório automático

`POST /api/reports` com `{"period":"diario"|"semanal"|"mensal"}` gera e persiste o relatório.
Agende com Vercel Cron, n8n ou qualquer scheduler:

```json
{ "crons": [{ "path": "/api/reports", "schedule": "0 11 * * 1" }] }
```

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Migrations em `supabase/migrations/` — aplique em ordem no SQL Editor do Supabase.

## Variáveis

| Variável | Obrigatória | Para quê |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | Leitura de todos os dados |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Leitura (RLS libera SELECT) |
| `SUPABASE_SERVICE_ROLE_KEY` | para escrever | Sync, mover lead, salvar relatório |
| `KOMMO_SUBDOMAIN` | para o CRM | `https://<subdomain>.kommo.com` |
| `KOMMO_ACCESS_TOKEN` | para o CRM | Token de longa duração da integração |
| `GROQ_API_KEY` | opcional | Redação por IA; sem ela a análise é determinística |
| `REACTOR_CLINIC_CONTEXT` | opcional | Contexto do negócio entregue ao copiloto |

Sem `GROQ_API_KEY` o copiloto continua funcionando: os números são os mesmos, calculados no
servidor, só não há redação por modelo. Sem `SUPABASE_SERVICE_ROLE_KEY` o sistema fica em modo
leitura e diz exatamente qual variável falta em vez de falhar em silêncio.
