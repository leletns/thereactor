import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, type ReactorTransaction } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

function parseType(value: string | null): "receita" | "despesa" | null {
  return value === "receita" || value === "despesa" ? value : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = parseType(searchParams.get("type"));
    const limit = Number(searchParams.get("limit") ?? 100);

    let query = getSupabase()
      .from("reactor_transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(Number.isFinite(limit) ? Math.min(limit, 1000) : 100);

    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return apiOk({ transactions: (data ?? []) as ReactorTransaction[] });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
