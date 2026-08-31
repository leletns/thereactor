import Groq from "groq-sdk";
import { clinicContext } from "@/lib/ai/clinic-context";
import type { ReactorSnapshot } from "@/lib/reactor/snapshot";

const GROQ_MODEL = "llama-3.3-70b-versatile";

export type CopilotSource = "groq" | "local";

export interface CopilotAnswer {
  answer: string;
  source: CopilotSource;
  /** Deterministic findings the answer is grounded on — always present. */
  findings: string[];
}

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Rules-based reading of the snapshot. This is the copilot's floor: it runs
 * whether or not an AI key is configured, and the model is told to build on it
 * rather than invent its own numbers.
 */
export function deriveFindings(snapshot: ReactorSnapshot): string[] {
  const { commercial, finance, clinic, ops } = snapshot;
  const findings: string[] = [];

  findings.push(
    `Pipeline aberto: ${commercial.openLeads} leads somando ${brl(commercial.openValue)}.`
  );

  if (commercial.stalled.length) {
    const worst = commercial.stalled[0];
    findings.push(
      `${commercial.stalled.length} leads sem movimento ha 3+ dias. O mais critico e ${worst.name} (${worst.days} dias parado, ${brl(worst.value)}, etapa ${worst.stage}).`
    );
  } else if (commercial.openLeads > 0) {
    findings.push("Nenhum lead aberto esta parado ha mais de 3 dias.");
  }

  if (commercial.wonLeads + commercial.lostLeads > 0) {
    findings.push(
      `Taxa de conversao de ${commercial.conversionRate}% (${commercial.wonLeads} ganhos, ${commercial.lostLeads} perdidos).`
    );
  }

  if (commercial.topLeads.length) {
    const top = commercial.topLeads[0];
    findings.push(
      `Maior oportunidade aberta: ${top.name}, ${brl(top.value)}, score ${top.score}, etapa ${top.stage}.`
    );
  }

  if (finance.transacoes > 0) {
    findings.push(
      `Financeiro: ${brl(finance.receita)} de receita contra ${brl(finance.despesas)} de despesa, margem de ${finance.margem}%.`
    );
    if (finance.margem < 20) {
      findings.push(
        `Margem abaixo de 20% — as despesas estao consumindo ${Math.round((finance.despesas / Math.max(finance.receita, 1)) * 100)}% da receita.`
      );
    }
    if (finance.topCategories.length && finance.receita > 0) {
      const top = finance.topCategories[0];
      findings.push(
        `${top.categoria} concentra ${Math.round((top.valor / finance.receita) * 100)}% da receita.`
      );
    }
  }

  if (clinic.total > 0) {
    findings.push(
      `Agenda: ${clinic.agendados + clinic.confirmados} atendimentos futuros (${brl(clinic.receitaPrevista)} previstos), comparecimento de ${clinic.taxaComparecimento}%.`
    );
    if (clinic.faltas > 0) {
      findings.push(`${clinic.faltas} falta(s) registrada(s) — vale reforcar confirmacao.`);
    }
  }

  if (ops.criticas > 0) {
    findings.push(`${ops.criticas} tarefa(s) critica(s) em aberto na operacao.`);
  }

  if (commercial.fromKommo === 0 && commercial.totalLeads > 0) {
    findings.push(
      "Nenhum lead veio do Kommo ainda — rode a sincronizacao para espelhar o CRM."
    );
  }

  return findings;
}

function localAnswer(question: string, findings: string[]): string {
  const header = question.trim()
    ? `Sobre "${question.trim()}", isto e o que os dados mostram agora:`
    : "Leitura da operacao agora:";
  return [header, "", ...findings.map((f) => `• ${f}`)].join("\n");
}

function systemPrompt(snapshot: ReactorSnapshot, findings: string[]) {
  return [
    "Voce e o copiloto comercial do The Reactor, usado pela equipe interna de uma clinica.",
    "Responda em portugues do Brasil, direto, sem rodeio e sem repetir a pergunta.",
    "",
    "CONTEXTO DO NEGOCIO:",
    clinicContext(),
    "",
    "REGRAS DURAS:",
    "- Use SOMENTE os numeros dos dados abaixo. Nunca invente valores, nomes ou datas.",
    "- Se a informacao nao estiver nos dados, diga que nao esta disponivel no sistema.",
    "- Termine sempre com 2 a 4 acoes concretas, cada uma citando o lead ou numero que a justifica.",
    "- Nao de conselho medico nem prometa resultado clinico.",
    "",
    "LEITURA DETERMINISTICA JA CALCULADA (use como base, nao contradiga):",
    ...findings.map((f) => `- ${f}`),
    "",
    "DADOS BRUTOS (JSON):",
    JSON.stringify(snapshot),
  ].join("\n");
}

export async function askCopilot(
  question: string,
  snapshot: ReactorSnapshot
): Promise<CopilotAnswer> {
  const findings = deriveFindings(snapshot);

  if (!process.env.GROQ_API_KEY) {
    return { answer: localAnswer(question, findings), source: "local", findings };
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt(snapshot, findings) },
        {
          role: "user",
          content:
            question.trim() ||
            "Faca um diagnostico da operacao comercial agora e diga o que priorizar hoje.",
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) throw new Error("resposta vazia");
    return { answer, source: "groq", findings };
  } catch {
    // A model outage must never leave the user with an empty panel.
    return { answer: localAnswer(question, findings), source: "local", findings };
  }
}

/** Executive narrative for the automated report. */
export async function writeReportNarrative(
  snapshot: ReactorSnapshot
): Promise<{ summary: string; source: CopilotSource; findings: string[] }> {
  const findings = deriveFindings(snapshot);
  const fallback = [
    `No periodo de ${snapshot.period.days} dias, o pipeline fechou com ${snapshot.commercial.openLeads} leads abertos somando ${brl(snapshot.commercial.openValue)} e conversao de ${snapshot.commercial.conversionRate}%.`,
    `O financeiro registrou ${brl(snapshot.finance.receita)} de receita e ${brl(snapshot.finance.despesas)} de despesa, resultando em margem de ${snapshot.finance.margem}%.`,
    snapshot.clinic.total > 0
      ? `A agenda tem ${snapshot.clinic.agendados + snapshot.clinic.confirmados} atendimentos futuros e comparecimento de ${snapshot.clinic.taxaComparecimento}%.`
      : "A agenda ainda nao possui atendimentos registrados no periodo.",
  ].join(" ");

  if (!process.env.GROQ_API_KEY) {
    return { summary: fallback, source: "local", findings };
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.25,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt(snapshot, findings) },
        {
          role: "user",
          content:
            "Escreva o resumo executivo deste periodo em 2 paragrafos curtos: o primeiro com o que aconteceu no comercial e no financeiro, o segundo com os riscos e o que a equipe deve atacar. Sem titulos, sem bullet points.",
        },
      ],
    });
    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) throw new Error("resposta vazia");
    return { summary, source: "groq", findings };
  } catch {
    return { summary: fallback, source: "local", findings };
  }
}
