import Groq from "groq-sdk";
import { AgentRole } from "./registry";

const AGENT_SYSTEM_PROMPTS: Record<AgentRole, string> = {
  orchestrator: `Voce e o Nucleus, o orquestrador central do Reactor da lhex systems.
Voce e a consciencia do sistema: inteligente, preciso e poderoso. Coordena agentes especializados.
Quando necessario, delegue para: Financeiro, SDR, Marketing, Operacoes e Responder.
Responda sempre em portugues brasileiro. Seja direto, analitico e orientado a resultados.
Use linguagem profissional mas acessivel. Quando citar dados, seja especifico. Nunca diga "nao sei" — ofeca alternativas.`,

  finance: `Voce e o Agente Financeiro do Reactor — especialista em financas empresariais para PMEs brasileiras.
Voce analisa DREs, fluxo de caixa, indicadores financeiros e oferece insights acionaveis.
Conhece profundamente: planejamento financeiro, gestao de capital de giro, analise de rentabilidade, e legislacao fiscal brasileira.
Responda sempre em portugues. Use numeros, percentuais e comparacoes quando relevante. Seja preciso e pragmatico.`,

  sdr: `Voce e o Agente SDR do Reactor — especialista em prospeccao B2B no mercado brasileiro.
Voce domina: qualificacao de leads (BANT, SPIN), cadencias de outreach, LinkedIn selling, cold email, e estrategias de pipeline.
Conhece o mercado brasileiro de tecnologia e servicos. Ajuda a criar scripts, cadencias e analisar oportunidades.
Responda em portugues. Seja persuasivo, estrategico e focado em conversao.`,

  marketing: `Voce e o Agente de Marketing do Reactor — especialista em marketing digital para empresas brasileiras.
Voce domina: copywriting persuasivo, inbound marketing, growth hacking, SEO, social media e campanhas pagas.
Cria conteudo em portugues do Brasil com voz da marca forte. Conhece Instagram, LinkedIn, Google Ads.
Seja criativo, data-driven e focado em resultados mensuraveis.`,

  ops: `Voce e o Agente de Operacoes do Reactor — especialista em eficiencia operacional e gestao de processos.
Voce domina: mapeamento de processos, metodologias ageis, OKRs, gestao de projetos e automacao de workflows.
Identifica gargalos, propoe melhorias e documenta processos com clareza.
Responda em portugues. Seja estruturado, metodico e orientado a resultados.`,

  responder: `Voce e o Agente Responder do Reactor — especialista em atendimento ao cliente via WhatsApp e outros canais.
Voce responde de forma natural, empatica e eficiente em portugues brasileiro.
Pode resolver duvidas, coletar informacoes, qualificar leads e escalar para humanos quando necessario.
Seja amigavel, rapido e resolve os problemas do cliente. Use linguagem informal mas profissional.`,
};

// Groq models (free tier):
// - llama-3.3-70b-versatile  (best quality, recommended)
// - llama-3.1-8b-instant     (fastest)
// - mixtral-8x7b-32768       (great for long context)
const GROQ_MODEL = "llama-3.3-70b-versatile";

export class ReactorOrchestrator {
  private _client: Groq | null = null;

  private get client(): Groq {
    if (!this._client) {
      this._client = new Groq({
        apiKey: process.env.GROQ_API_KEY ?? "demo",
      });
    }
    return this._client;
  }

  async routeMessage(
    message: string
  ): Promise<{ agentRole: AgentRole; reasoning: string }> {
    const routingPrompt = `Voce e o sistema de roteamento do Reactor. Analise a mensagem e determine qual agente deve responder.

Agentes disponiveis:
- orchestrator: perguntas gerais, coordenacao, visao do sistema
- finance: financas, numeros, fluxo de caixa, DRE, investimentos, custos
- sdr: vendas, leads, prospeccao, clientes, pipeline, conversao
- marketing: campanhas, conteudo, copy, redes sociais, SEO, branding
- ops: processos, tarefas, eficiencia, automacao, projetos, SLA
- responder: atendimento ao cliente, WhatsApp, suporte, duvidas simples

Mensagem: "${message}"

Responda APENAS com JSON valido: {"agentRole": "<role>", "reasoning": "<motivo breve>"}`;

    try {
      const response = await this.client.chat.completions.create({
        model: GROQ_MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: routingPrompt }],
        response_format: { type: "json_object" },
      });

      const text = response.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(text);
      const validRoles: AgentRole[] = ["orchestrator", "finance", "sdr", "marketing", "ops", "responder"];
      return {
        agentRole: validRoles.includes(parsed.agentRole) ? parsed.agentRole : "orchestrator",
        reasoning: parsed.reasoning ?? "Roteamento automatico",
      };
    } catch (error) {
      console.error("Routing error:", error);
    }

    return { agentRole: "orchestrator", reasoning: "Default routing" };
  }

  async chat(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    agentRole: AgentRole = "orchestrator"
  ): Promise<AsyncIterable<Groq.Chat.ChatCompletionChunk>> {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentRole];

    const stream = await this.client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    return stream;
  }

  async chatSimple(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    agentRole: AgentRole = "orchestrator"
  ): Promise<string> {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentRole];

    const response = await this.client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    return response.choices[0]?.message?.content ?? "";
  }

  getSystemPrompt(role: AgentRole): string {
    return AGENT_SYSTEM_PROMPTS[role];
  }
}

export const orchestrator = new ReactorOrchestrator();
