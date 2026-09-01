import { getSupabase } from "@/lib/fusion/supabase";
import { stageLabel } from "@/lib/reactor/labels";

/**
 * One read of the whole operation, shared by the automated report and the AI
 * copilot so both always describe exactly the same numbers.
 */
export interface ReactorSnapshot {
  period: { start: string; end: string; days: number };
  commercial: {
    totalLeads: number;
    newLeads: number;
    openLeads: number;
    wonLeads: number;
    lostLeads: number;
    openValue: number;
    wonValue: number;
    conversionRate: number;
    avgTicket: number;
    avgScore: number;
    stalled: { name: string; days: number; value: number; stage: string }[];
    topLeads: { name: string; value: number; score: number; stage: string }[];
    byStage: { stage: string; count: number; value: number }[];
    fromKommo: number;
  };
  finance: {
    receita: number;
    despesas: number;
    lucro: number;
    margem: number;
    transacoes: number;
    topCategories: { categoria: string; valor: number }[];
  };
  clinic: {
    total: number;
    agendados: number;
    confirmados: number;
    realizados: number;
    faltas: number;
    cancelados: number;
    taxaComparecimento: number;
    receitaPrevista: number;
  };
  ops: { total: number; abertas: number; concluidas: number; criticas: number };
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function buildSnapshot(days = 7): Promise<ReactorSnapshot> {
  const db = getSupabase();
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - days);

  const [leadsResult, txResult, apptResult, taskResult] = await Promise.all([
    db.from("reactor_leads").select("*"),
    db.from("reactor_transactions").select("*").neq("status", "cancelado"),
    db.from("reactor_appointments").select("*"),
    db.from("reactor_tasks").select("*"),
  ]);

  const firstError =
    leadsResult.error ?? txResult.error ?? apptResult.error ?? taskResult.error;
  if (firstError) throw new Error(firstError.message);

  const leads = leadsResult.data ?? [];
  const transactions = txResult.data ?? [];
  const appointments = apptResult.data ?? [];
  const tasks = taskResult.data ?? [];

  // ---- commercial --------------------------------------------------------
  const won = leads.filter((l) => l.status === "ganho");
  const lost = leads.filter((l) => l.status === "perdido");
  const open = leads.filter((l) => l.status !== "ganho" && l.status !== "perdido");
  const decided = won.length + lost.length;
  const scored = leads.filter((l) => typeof l.score === "number");

  const stageName = (lead: (typeof leads)[number]) =>
    lead.kommo_status_name ?? stageLabel(lead.status);

  const daysSince = (iso: string | null) =>
    iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : 999;

  const stalled = open
    .map((lead) => ({
      name: lead.name,
      days: daysSince(lead.last_activity_at ?? lead.updated_at),
      value: Number(lead.value ?? 0),
      stage: stageName(lead),
    }))
    .filter((l) => l.days >= 3)
    .sort((a, b) => b.days - a.days || b.value - a.value)
    .slice(0, 8);

  const byStageMap = new Map<string, { count: number; value: number }>();
  for (const lead of leads) {
    const key = stageName(lead);
    const bucket = byStageMap.get(key) ?? { count: 0, value: 0 };
    bucket.count += 1;
    bucket.value += Number(lead.value ?? 0);
    byStageMap.set(key, bucket);
  }

  // ---- finance -----------------------------------------------------------
  const receita = transactions
    .filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const despesas = transactions
    .filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const lucro = receita - despesas;

  const categoryMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== "receita") continue;
    categoryMap.set(tx.category, (categoryMap.get(tx.category) ?? 0) + Number(tx.amount));
  }

  // ---- clinic ------------------------------------------------------------
  const countAppt = (status: string) =>
    appointments.filter((a) => a.status === status).length;
  const realizados = countAppt("realizado");
  const missed = countAppt("faltou") + countAppt("cancelado");

  return {
    period: { start: isoDate(start), end: isoDate(end), days },
    commercial: {
      totalLeads: leads.length,
      newLeads: leads.filter((l) => new Date(l.created_at) >= start).length,
      openLeads: open.length,
      wonLeads: won.length,
      lostLeads: lost.length,
      openValue: open.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
      wonValue: won.reduce((sum, l) => sum + Number(l.value ?? 0), 0),
      conversionRate: decided ? Math.round((won.length / decided) * 100) : 0,
      avgTicket: leads.length
        ? Math.round(leads.reduce((sum, l) => sum + Number(l.value ?? 0), 0) / leads.length)
        : 0,
      avgScore: scored.length
        ? Math.round(scored.reduce((sum, l) => sum + Number(l.score), 0) / scored.length)
        : 0,
      stalled,
      topLeads: [...open]
        .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))
        .slice(0, 5)
        .map((l) => ({
          name: l.name,
          value: Number(l.value ?? 0),
          score: Number(l.score ?? 0),
          stage: stageName(l),
        })),
      byStage: Array.from(byStageMap.entries())
        .map(([stage, bucket]) => ({ stage, ...bucket }))
        .sort((a, b) => b.count - a.count),
      fromKommo: leads.filter((l) => l.kommo_lead_id !== null).length,
    },
    finance: {
      receita,
      despesas,
      lucro,
      margem: receita > 0 ? Number(((lucro / receita) * 100).toFixed(1)) : 0,
      transacoes: transactions.length,
      topCategories: Array.from(categoryMap.entries())
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
    },
    clinic: {
      total: appointments.length,
      agendados: countAppt("agendado"),
      confirmados: countAppt("confirmado"),
      realizados,
      faltas: countAppt("faltou"),
      cancelados: countAppt("cancelado"),
      taxaComparecimento:
        realizados + missed ? Math.round((realizados / (realizados + missed)) * 100) : 0,
      receitaPrevista: appointments
        .filter((a) => a.status === "agendado" || a.status === "confirmado")
        .reduce((sum, a) => sum + Number(a.value ?? 0), 0),
    },
    ops: {
      total: tasks.length,
      abertas: tasks.filter((t) => t.status === "aberta" || t.status === "em_progresso")
        .length,
      concluidas: tasks.filter((t) => t.status === "concluida").length,
      criticas: tasks.filter((t) => t.priority === "critica" && t.status !== "concluida")
        .length,
    },
  };
}
