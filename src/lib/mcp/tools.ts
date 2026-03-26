export interface MCPToolParameter {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  items?: { type: string };
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  category: string;
  parameters: Record<string, MCPToolParameter>;
  requiredParams: string[];
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: "analyze_financials",
    description:
      "Analisa transações financeiras e retorna análise completa com insights, métricas e recomendações de otimização",
    category: "finance",
    parameters: {
      transactions: {
        type: "array",
        description:
          "Lista de transações com campos: date, amount, type (receita/despesa), category, description",
        required: true,
        items: { type: "object" },
      },
      period: {
        type: "string",
        description: "Período de análise (ex: 2024-Q1, 2024-01, 2024)",
      },
      include_forecast: {
        type: "boolean",
        description: "Incluir projeção para os próximos 3 meses",
      },
    },
    requiredParams: ["transactions"],
  },
  {
    name: "score_lead",
    description:
      "Pontua e qualifica um lead com score de 0 a 100 baseado em dados comportamentais e firmográficos",
    category: "sdr",
    parameters: {
      lead_data: {
        type: "object",
        description:
          "Dados do lead: name, company, email, phone, segment, revenue, employees, behavior, source",
        required: true,
      },
      scoring_model: {
        type: "string",
        description: "Modelo de scoring a usar",
        enum: ["bant", "meddic", "custom"],
      },
    },
    requiredParams: ["lead_data"],
  },
  {
    name: "generate_marketing_copy",
    description:
      "Gera variações de copy de marketing otimizadas para diferentes canais e objetivos",
    category: "marketing",
    parameters: {
      brief: {
        type: "string",
        description: "Brief criativo com produto, público-alvo e objetivo",
        required: true,
      },
      channels: {
        type: "array",
        description: "Canais alvo: email, instagram, linkedin, google_ads, whatsapp",
        items: { type: "string" },
      },
      tone: {
        type: "string",
        description: "Tom da comunicação",
        enum: ["professional", "casual", "urgent", "inspirational", "educational"],
      },
      variants: {
        type: "number",
        description: "Número de variações a gerar (1-5)",
      },
    },
    requiredParams: ["brief"],
  },
  {
    name: "optimize_process",
    description:
      "Analisa e otimiza um processo operacional, identificando gargalos e propondo melhorias com ROI estimado",
    category: "ops",
    parameters: {
      process_description: {
        type: "string",
        description: "Descrição detalhada do processo atual",
        required: true,
      },
      current_metrics: {
        type: "object",
        description: "Métricas atuais: tempo_medio, taxa_erro, custo, volume",
      },
      constraints: {
        type: "array",
        description: "Restrições: budget, timeline, tecnologia",
        items: { type: "string" },
      },
    },
    requiredParams: ["process_description"],
  },
  {
    name: "send_whatsapp",
    description:
      "Envia mensagem de texto ou mídia via WhatsApp através da Evolution API",
    category: "channels",
    parameters: {
      phone: {
        type: "string",
        description: "Número do destinatário com DDD (ex: 11999999999)",
        required: true,
      },
      message: {
        type: "string",
        description: "Conteúdo da mensagem de texto",
        required: true,
      },
      instance: {
        type: "string",
        description: "Nome da instância do WhatsApp (padrão: reactor-main)",
      },
      media_url: {
        type: "string",
        description: "URL de mídia para envio com legenda",
      },
    },
    requiredParams: ["phone", "message"],
  },
  {
    name: "query_database",
    description:
      "Consulta o banco de dados do Reactor em linguagem natural e retorna resultados estruturados",
    category: "data",
    parameters: {
      query_description: {
        type: "string",
        description: "Descrição em português do que buscar (ex: leads com score > 70 criados este mês)",
        required: true,
      },
      table: {
        type: "string",
        description: "Tabela principal da consulta",
        enum: [
          "reactor_sessions",
          "reactor_messages",
          "reactor_leads",
          "reactor_transactions",
          "reactor_tasks",
          "reactor_events",
        ],
      },
      limit: {
        type: "number",
        description: "Número máximo de resultados (padrão: 50)",
      },
      format: {
        type: "string",
        description: "Formato de saída",
        enum: ["table", "json", "summary"],
      },
    },
    requiredParams: ["query_description"],
  },
];

export type MCPTool = (typeof MCP_TOOLS)[number];

export function getToolByName(name: string): MCPToolDefinition | undefined {
  return MCP_TOOLS.find((tool) => tool.name === name);
}

export function getToolsByCategory(category: string): MCPToolDefinition[] {
  return MCP_TOOLS.filter((tool) => tool.category === category);
}

export function getToolsForAnthropicAPI(): Array<{
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}> {
  return MCP_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: "object" as const,
      properties: Object.fromEntries(
        Object.entries(tool.parameters).map(([key, param]) => [
          key,
          {
            type: param.type,
            description: param.description,
            ...(param.enum ? { enum: param.enum } : {}),
            ...(param.items ? { items: param.items } : {}),
          },
        ])
      ),
      required: tool.requiredParams,
    },
  }));
}
