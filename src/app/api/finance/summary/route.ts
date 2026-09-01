import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, type ReactorTransaction } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function monthKey(date: string) {
  return date.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[Number(month) - 1]}/${year.slice(2)}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = Math.min(Number(searchParams.get("months") ?? 12) || 12, 36);

    const { data, error } = await getSupabase()
      .from("reactor_transactions")
      .select("*")
      .neq("status", "cancelado")
      .order("date", { ascending: true });
    if (error) throw new Error(error.message);

    const transactions = (data ?? []) as ReactorTransaction[];

    // Monthly receita/despesa/lucro series.
    const byMonth = new Map<string, { receita: number; despesas: number }>();
    for (const tx of transactions) {
      const key = monthKey(tx.date);
      const bucket = byMonth.get(key) ?? { receita: 0, despesas: 0 };
      if (tx.type === "receita") bucket.receita += Number(tx.amount);
      else bucket.despesas += Number(tx.amount);
      byMonth.set(key, bucket);
    }

    const monthly = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-months)
      .map(([key, bucket]) => ({
        key,
        mes: monthLabel(key),
        receita: bucket.receita,
        despesas: bucket.despesas,
        lucro: bucket.receita - bucket.despesas,
      }));

    // Revenue split by category.
    const byCategory = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "receita") continue;
      byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + Number(tx.amount));
    }
    const categories = Array.from(byCategory.entries())
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);

    const receita = transactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const despesas = transactions
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const lucro = receita - despesas;

    const current = monthly[monthly.length - 1];
    const previous = monthly[monthly.length - 2];
    const growth =
      current && previous && previous.receita > 0
        ? Number((((current.receita - previous.receita) / previous.receita) * 100).toFixed(1))
        : null;

    return apiOk({
      totals: {
        receita,
        despesas,
        lucro,
        margem: receita > 0 ? Number(((lucro / receita) * 100).toFixed(1)) : 0,
        transacoes: transactions.length,
      },
      currentMonth: current ?? null,
      growth,
      monthly,
      categories,
      recent: [...transactions].reverse().slice(0, 10),
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
