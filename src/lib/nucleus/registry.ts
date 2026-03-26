export type AgentRole =
  | "orchestrator"
  | "finance"
  | "sdr"
  | "marketing"
  | "ops"
  | "responder";

export type AgentStatus = "online" | "processing" | "idle" | "offline";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  description: string;
  color: string;
  icon: string;
  capabilities: string[];
  messagesHandled: number;
  uptime: string;
}

export const REACTOR_AGENTS: Agent[] = [
  {
    id: "orchestrator-001",
    name: "Nucleus",
    role: "orchestrator",
    status: "online",
    description:
      "Orquestrador central do Reactor. Roteia requisições, coordena agentes e mantém a consciência do sistema.",
    color: "#00f5ff",
    icon: "Brain",
    capabilities: [
      "Roteamento inteligente de mensagens",
      "Coordenação multi-agente",
      "Análise de contexto",
      "Delegação de tarefas",
      "Síntese de respostas",
    ],
    messagesHandled: 4872,
    uptime: "99.97%",
  },
  {
    id: "finance-001",
    name: "Financeiro",
    role: "finance",
    status: "online",
    description:
      "Especialista em análise financeira, fluxo de caixa, DRE e inteligência de negócios financeiros.",
    color: "#00ff88",
    icon: "TrendingUp",
    capabilities: [
      "Análise de DRE",
      "Projeção de fluxo de caixa",
      "Identificação de anomalias",
      "Relatórios financeiros",
      "Benchmarking setorial",
    ],
    messagesHandled: 1243,
    uptime: "99.91%",
  },
  {
    id: "sdr-001",
    name: "SDR",
    role: "sdr",
    status: "processing",
    description:
      "Agente de prospecção e qualificação de leads. Gerencia pipeline de vendas e cadências de outreach.",
    color: "#8b5cf6",
    icon: "Users",
    capabilities: [
      "Score de leads",
      "Cadências automatizadas",
      "Qualificação BANT",
      "Análise de pipeline",
      "Follow-up inteligente",
    ],
    messagesHandled: 2891,
    uptime: "98.44%",
  },
  {
    id: "marketing-001",
    name: "Marketing",
    role: "marketing",
    status: "online",
    description:
      "Criação de conteúdo, análise de campanhas, geração de copy e estratégias de growth marketing.",
    color: "#ff6b35",
    icon: "Megaphone",
    capabilities: [
      "Geração de copy",
      "Análise de campanhas",
      "SEO e conteúdo",
      "Social media strategy",
      "A/B testing insights",
    ],
    messagesHandled: 1567,
    uptime: "99.82%",
  },
  {
    id: "ops-001",
    name: "Operações",
    role: "ops",
    status: "idle",
    description:
      "Otimização de processos, gestão de tarefas, automações operacionais e eficiência organizacional.",
    color: "#fbbf24",
    icon: "Settings2",
    capabilities: [
      "Mapeamento de processos",
      "Automação de tarefas",
      "Gestão de SLAs",
      "Análise de gargalos",
      "Documentação técnica",
    ],
    messagesHandled: 934,
    uptime: "99.65%",
  },
  {
    id: "responder-001",
    name: "Responder",
    role: "responder",
    status: "online",
    description:
      "Agente de atendimento multicanal. Processa mensagens do WhatsApp, email e outros canais em tempo real.",
    color: "#34d399",
    icon: "MessageSquare",
    capabilities: [
      "Atendimento WhatsApp",
      "Respostas contextuais",
      "Escalamento inteligente",
      "Triagem de mensagens",
      "Respostas em português",
    ],
    messagesHandled: 7234,
    uptime: "99.99%",
  },
];

export class AgentRegistry {
  private agents: Map<string, Agent>;

  constructor() {
    this.agents = new Map(REACTOR_AGENTS.map((agent) => [agent.id, agent]));
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getByRole(role: AgentRole): Agent | undefined {
    return Array.from(this.agents.values()).find(
      (agent) => agent.role === role
    );
  }

  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  updateStatus(id: string, status: AgentStatus): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    this.agents.set(id, { ...agent, status });
    return true;
  }

  incrementMessages(id: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      this.agents.set(id, {
        ...agent,
        messagesHandled: agent.messagesHandled + 1,
      });
    }
  }

  toJSON(): Agent[] {
    return this.getAll();
  }
}

export const agentRegistry = new AgentRegistry();
