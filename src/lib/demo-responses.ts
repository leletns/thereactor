import { AgentRole } from "@/lib/nucleus/registry";

const DEMOS: Record<AgentRole, Record<string, string>> = {
  orchestrator: {
    default:
      "**Reactor Orchestrator** online.\n\nAnalisei sua solicitacao e estou coordenando os agentes especializados.\n\n**Agentes ativos:**\n- Finance Agent - analise financeira em tempo real\n- SDR Agent - pipeline de vendas e lead scoring\n- Marketing Agent - geracao de copy e campanhas\n- Ops Agent - otimizacao de processos\n- Responder Agent - WhatsApp e canais\n\nComo posso direcionar sua solicitacao?",
    financ:
      "Delegando para o **Finance Agent**...\n\nBaseado nos dados do ultimo trimestre:\n- Receita: **R$ 847.000** (+18.3% vs Q3)\n- Margem liquida: **34.2%**\n- Burn rate: dentro do planejado\n\n**Recomendacao:** momento favoravel para investir em aquisicao - CAC esta 23% abaixo da meta.",
    lead: "Acionando **SDR Agent** para analise de leads...\n\nPipeline atual:\n- 47 leads em prospeccao\n- 12 em qualificacao\n- 8 com proposta enviada\n- **Score medio: 71/100**\n\nTop lead: TechCorp Brasil - R$ 180.000 ARR, score 94. Recomendo contato imediato via WhatsApp.",
  },
  finance: {
    default:
      "**Finance Agent** - Analise Financeira\n\nResumo Marco 2025:\n\n| Metrica | Valor | Variacao |\n|---------|-------|----------|\n| Receita | R$ 258.000 | +10.3% |\n| Despesas | R$ 142.000 | +5.9% |\n| Lucro Liquido | R$ 116.000 | +16.1% |\n| Fluxo de Caixa | R$ 89.000 | +8.4% |\n\n**Insight:** Margem em expansao. Recomendo aportar 30% do lucro em fundo de reserva e 20% em marketing para capitalizar o momentum.",
    receita:
      "**Analise de Receita**\n\nTendencia dos ultimos 6 meses: crescimento consistente (+12% MoM).\n\n**Principais fontes:**\n1. Contratos recorrentes: 67%\n2. Novos clientes: 23%\n3. Upsell: 10%\n\n**Projecao Q2 2025:** R$ 320.000 com 87% de confianca.\n\nFoco recomendado: expandir contratos recorrentes - LTV 4x maior que clientes spot.",
    despesa:
      "**Analise de Despesas**\n\nPrincipais centros de custo:\n- Folha de pagamento: 45%\n- Infraestrutura tech: 18%\n- Marketing: 22%\n- Operacional: 15%\n\n**Alerta:** Infraestrutura cresceu 31% vs mes anterior. Verifique servicos nao utilizados. Potencial de economia: R$ 8.000/mes.",
  },
  sdr: {
    default:
      "**SDR Agent** - Pipeline de Vendas\n\n```\nProspeccao   47 leads\nQualificacao 23 leads\nProposta     11 leads\nFechamento    6 leads\n```\n\n**Taxa de conversao:** 8.3% (meta: 10%)\n**Receita em pipeline:** R$ 1.240.000\n\nLead quente: **Grupo Nexus Ltda** - score 91/100, budget confirmado R$ 240.000. Recomendo follow-up em 24h.",
    lead: "**Lead Analysis**\n\nScore calculado com metodologia BANT:\n\n- Budget: Confirmado (R$ 150k+)\n- Authority: CEO envolvido\n- Need: Dor clara identificada\n- Timeline: Q3 2025\n\n**Score Final: 84/100** - HOT LEAD\n\n**Cadencia recomendada:**\n1. WhatsApp hoje - case study\n2. Ligacao D+2 - demo personalizada\n3. Proposta D+5\n4. Follow-up D+7",
    cadencia:
      "**Cadencia Gerada pela IA:**\n\n**Dia 1 - WhatsApp:**\n\"Ola [Nome]! Vi que a [Empresa] esta crescendo no setor. Ajudamos empresas similares a aumentar conversao em 40%. Posso te mostrar como em 15 minutos?\"\n\n**Dia 3 - Email:**\nAssunto: Como a TechBrasil aumentou ARR em 180%\n\n**Dia 7 - LinkedIn:**\nConexao + mensagem de valor\n\n**Dia 10 - Ligacao:**\nScript de qualificacao MEDDIC",
  },
  marketing: {
    default:
      "**Marketing Agent** - Estrategia e Criacao\n\n**Performance das campanhas:**\n\n| Campanha | Alcance | CTR | Custo/Lead |\n|----------|---------|-----|------------|\n| LinkedIn B2B | 45.200 | 3.2% | R$ 87 |\n| Google Ads | 128.000 | 1.8% | R$ 54 |\n| Email Nurture | 8.400 | 22% | R$ 12 |\n\n**Insight:** Email tem melhor ROI. Recomendo dobrar frequencia de nurture para leads SDR com score acima de 70.",
    copy: "**Copy Gerado:**\n\n**Versao 1 - Urgencia:**\n\"Sua empresa perde R$ 50.000/mes sem automacao inteligente. O Reactor resolve em 48h.\"\n\n**Versao 2 - Social Proof:**\n\"87 empresas ja substituiram 5 funcionarios pelo Reactor. Sua vez.\"\n\n**Versao 3 - Curiosidade:**\n\"O que acontece quando IA assume seu financeiro, SDR e marketing ao mesmo tempo?\"\n\n**Recomendacao:** Versao 1 para topo de funil, Versao 3 para remarketing.",
    campanha:
      "**Plano de Campanha:**\n\nObjetivo: Geracao de leads B2B\nBudget sugerido: R$ 15.000/mes\nMeta: 180 MQLs/mes\n\n**Mix de canais:**\n- LinkedIn Ads: 40% (decisores C-Level)\n- Google Search: 30% (intencao de compra)\n- Conteudo organico: 20% (SEO + LinkedIn)\n- Email: 10% (base existente)\n\nPrazo para resultados: 45-60 dias",
  },
  ops: {
    default:
      "**Ops Agent** - Gestao de Operacoes\n\nStatus operacional:\n- Tarefas concluidas hoje: 23/31\n- Em andamento: 8 tarefas\n- Criticas atrasadas: 2\n\n**Eficiencia do time:** 87.3% (meta: 85%)\n\nGargalo principal: Onboarding de clientes (12 dias vs meta 7 dias)\n\n**Solucao:** Automatizar etapas 2, 4 e 6 do onboarding - estimativa de reducao para 4 dias.",
    processo:
      "**Otimizacao de Processo:**\n\nFluxo atual:\n[Entrada] - Manual (2h) - Revisao (1h) - Aprovacao (4h) - Entrega\n\nFluxo otimizado:\n[Entrada] - IA Triagem (2min) - Auto-aprovacao (<R$5k) - Entrega\n                            - Revisao humana (>R$5k)\n\n**Ganho estimado:** 87% de reducao no tempo de ciclo\n**Economia mensal:** R$ 18.000 em horas de trabalho",
    tarefa:
      "**Tarefas Prioritarias:**\n\nCRITICO:\n- Proposta Grupo Nexus vence em 48h\n- Renovacao contrato TechBrasil (R$ 280k ARR)\n\nALTA:\n- Onboarding cliente Finbank (dia 5/7)\n- Review de processos Q1\n\nNORMAL:\n- Documentacao atualizada\n- Reuniao equipe sexta 10h\n\n**Sugestao:** Automatizar alertas de renovacao.",
  },
  responder: {
    default:
      "**Responder Agent** - Canais de Comunicacao\n\nMonitorando todos os canais em tempo real:\n\n- WhatsApp: 3 conversas ativas\n- Email: 12 mensagens pendentes\n- Chat: 1 visitante online\n\n**Ultima mensagem recebida:**\n\"Ola, quero saber mais sobre os planos\"\n\n**Resposta automatica enviada:**\n\"Ola! Sou o assistente da lhex systems. Temos planos a partir de R$ 2.500/mes com ROI garantido em 90 dias. Posso agendar uma demo?\"\n\nTaxa de resposta: 100% em menos de 2 minutos",
  },
};

export function getDemoResponse(role: AgentRole, message: string): string {
  const lower = message.toLowerCase();
  const agentDemos = DEMOS[role] ?? DEMOS.orchestrator;

  for (const [key, response] of Object.entries(agentDemos)) {
    if (key !== "default" && lower.includes(key)) {
      return response;
    }
  }

  return agentDemos.default ?? DEMOS.orchestrator.default;
}
