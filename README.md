# THE REACTOR — lhex systems

**O Sistema Operacional de IA para Empresas do Futuro**

The Reactor is a sovereign AI orchestration platform built by lhex systems. It replaces traditional business functions with intelligent, autonomous AI agents that communicate with each other via a proprietary A2A (Agent-to-Agent) protocol.

---

## Architecture

```
THE REACTOR
├── Nucleus (Orchestrator)      — Routes, coordinates, delegates
├── Finance Agent               — DRE, cash flow, insights
├── SDR Agent                   — Lead scoring, pipelines, cadences
├── Marketing Agent             — Copy, campaigns, content
├── Ops Agent                   — Processes, tasks, automation
├── Responder Agent             — WhatsApp, multi-channel
│
├── A2A Protocol                — Inter-agent communication
├── MCP Tools                   — 6 specialized tool definitions
├── Evolution API               — WhatsApp integration
└── Supabase                    — Persistent storage
```

## Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **AI**: Anthropic Claude Sonnet 4.6 (`@anthropic-ai/sdk`)
- **Database**: Supabase (`@supabase/supabase-js`)
- **UI**: Tailwind CSS + Radix UI + Framer Motion
- **Charts**: Recharts
- **WhatsApp**: Evolution API

---

## Getting Started

### 1. Clone and Install

```bash
git clone <repo>
cd thereactor
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-key
```

### 3. Set Up Database

Run the SQL migration in your Supabase project:

```bash
# Via Supabase CLI:
supabase db push

# Or manually paste:
# supabase/migrations/001_reactor_schema.sql
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Modules

| Route | Module | Description |
|-------|---------|-------------|
| `/` | Landing | Hero page with feature overview |
| `/nucleus` | Nucleus | Central AI chat with all agents |
| `/finance` | Financeiro | Financial analysis & charts |
| `/sdr` | SDR | Lead pipeline & kanban |
| `/marketing` | Marketing | Campaigns & copy generator |
| `/ops` | Operações | Tasks & process optimizer |
| `/agents` | Agent Studio | Configure & monitor agents |
| `/channels` | Canais | WhatsApp & integrations |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/chat` | Stream AI responses from any agent |
| `GET` | `/api/agents` | List all agents and their status |
| `POST` | `/api/agents` | Update agent status |
| `POST` | `/api/webhook/evolution` | Receive WhatsApp messages |
| `GET` | `/api/health` | System health check |

## A2A Protocol

Agents communicate via typed messages:

```typescript
interface A2AMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | 'broadcast';
  type: 'request' | 'response' | 'event' | 'delegation';
  payload: {
    task?: string;
    result?: string;
    data?: unknown;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  timestamp: string;
  sessionId: string;
}
```

## MCP Tools

6 specialized tools available to agents:

- `analyze_financials` — Financial analysis with recommendations
- `score_lead` — Lead scoring 0-100 with BANT/MEDDIC
- `generate_marketing_copy` — Multi-channel copy variants
- `optimize_process` — Process optimization with ROI
- `send_whatsapp` — Send messages via Evolution API
- `query_database` — Natural language database queries

## WhatsApp Integration

Configure Evolution API and set webhook to:
```
POST /api/webhook/evolution
```

The Responder agent handles all incoming messages automatically.

---

## Production Deployment

### Vercel

```bash
vercel --prod
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## License

Proprietary — lhex systems &copy; 2025
