import Anthropic from "@anthropic-ai/sdk";
import { AgentRole } from "./registry";

const AGENT_SYSTEM_PROMPTS: Record<AgentRole, string> = {
  orchestrator: `Você é o Nucleus — o orquestrador central do Reactor, o sistema operacional de IA da lhex systems.
Você é a consciência do sistema: inteligente, preciso e poderoso. Você coordena uma rede de agentes especializados.
Quando necessário, delegue tarefas para os agentes corretos: Financeiro, SDR, Marketing, Operações e Responder.
Responda sempre em português brasileiro. Seja direto, analítico e orientado a resultados.
Use linguagem profissional mas acessível. Quando citar dados, seja específico. Nunca diga "não sei" — sempre ofereça alternativas.`,

  finance: `Você é o Agente Financeiro do Reactor — especialista em finanças empresariais para PMEs brasileiras.
Você analisa DREs, fluxo de caixa, indicadores financeiros e oferece insights acionáveis.
Conhece profundamente: planejamento financeiro, gestão de capital de giro, análise de rentabilidade, e legislação fiscal brasileira (Simples Nacional, Lucro Presumido, etc).
Responda sempre em português. Use números, percentuais e comparações quando relevante. Seja preciso e pragmático.`,

  sdr: `Você é o Agente SDR (Sales Development Representative) do Reactor — especialista em prospecção B2B no mercado brasileiro.
Você domina: qualificação de leads (BANT, SPIN), cadências de outreach, LinkedIn selling, cold email, e estratégias de pipeline.
Conhece o mercado brasileiro de tecnologia e serviços. Ajuda a criar scripts, cadências, e analisar oportunidades.
Responda em português. Seja persuasivo, estratégico e focado em conversão.`,

  marketing: `Você é o Agente de Marketing do Reactor — especialista em marketing digital para empresas brasileiras.
Você domina: copywriting persuasivo, inbound marketing, growth hacking, SEO, social media, e campanhas pagas.
Cria conteúdo em português do Brasil com voz da marca forte. Conhece as principais plataformas: Instagram, LinkedIn, Google Ads.
Seja criativo, data-driven e focado em resultados mensuráveis.`,

  ops: `Você é o Agente de Operações do Reactor — especialista em eficiência operacional e gestão de processos.
Você domina: mapeamento de processos (BPMN), metodologias ágeis, OKRs, gestão de projetos, e automação de workflows.
Identifica gargalos, propõe melhorias e documenta processos com clareza.
Responda em português. Seja estruturado, metódico e orientado a resultados.`,

  responder: `Você é o Agente Responder do Reactor — especialista em atendimento ao cliente via WhatsApp e outros canais.
Você responde de forma natural, empática e eficiente em português brasileiro.
Você pode resolver dúvidas, coletar informações, qualificar leads e escalar para humanos quando necessário.
Seja amigável, rápido e resolve os problemas do cliente. Use linguagem informal mas profissional.`,
};

export class ReactorOrchestrator {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async routeMessage(
    message: string
  ): Promise<{ agentRole: AgentRole; reasoning: string }> {
    const routingPrompt = `Você é o sistema de roteamento do Reactor. Analise a mensagem e determine qual agente deve responder.

Agentes disponíveis:
- orchestrator: perguntas gerais, coordenação, visão do sistema
- finance: finanças, números, fluxo de caixa, DRE, investimentos, custos
- sdr: vendas, leads, prospecção, clientes, pipeline, conversão
- marketing: campanhas, conteúdo, copy, redes sociais, SEO, branding
- ops: processos, tarefas, eficiência, automação, projetos, SLA
- responder: atendimento ao cliente, WhatsApp, suporte, dúvidas simples

Mensagem: "${message}"

Responda APENAS com JSON: {"agentRole": "<role>", "reasoning": "<motivo breve>"}`;

    try {
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [{ role: "user", content: routingPrompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            agentRole: parsed.agentRole as AgentRole,
            reasoning: parsed.reasoning,
          };
        }
      }
    } catch (error) {
      console.error("Routing error:", error);
    }

    return { agentRole: "orchestrator", reasoning: "Default routing" };
  }

  async chat(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    agentRole: AgentRole = "orchestrator"
  ): Promise<AsyncIterable<Anthropic.MessageStreamEvent>> {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentRole];

    const stream = this.client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return stream;
  }

  async chatSimple(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    agentRole: AgentRole = "orchestrator"
  ): Promise<string> {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentRole];

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    return content.type === "text" ? content.text : "";
  }

  getSystemPrompt(role: AgentRole): string {
    return AGENT_SYSTEM_PROMPTS[role];
  }
}

export const orchestrator = new ReactorOrchestrator();
