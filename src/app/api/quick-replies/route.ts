import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, getSupabaseAdmin } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("reactor_quick_replies")
      .select("*")
      .eq("active", true)
      .order("sort", { ascending: true });
    if (error) throw new Error(error.message);

    return apiOk({ quickReplies: data ?? [] });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}

interface CreateBody {
  title: string;
  body: string;
  category?: string;
}

/** Deixa o time criar novos atalhos direto da tela de mensagens, sem depender de mim. */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateBody;
    if (!payload?.title?.trim() || !payload?.body?.trim()) {
      return apiFail("Parametros title e body sao obrigatorios.", 400);
    }

    const db = getSupabaseAdmin();
    const { data: existing } = await db
      .from("reactor_quick_replies")
      .select("sort")
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await db
      .from("reactor_quick_replies")
      .insert({
        title: payload.title.trim(),
        body: payload.body.trim(),
        category: payload.category?.trim() || "geral",
        sort: (existing?.sort ?? 0) + 10,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return apiOk({ quickReply: data });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
