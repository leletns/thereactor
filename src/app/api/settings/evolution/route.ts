import { NextRequest } from "next/server";
import { apiOk, apiFail } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/fusion/supabase";

export const dynamic = "force-dynamic";

/** GET — retorna status atual da config da Evolution API */
export async function GET() {
  try {
    const db = getSupabaseAdmin();
    const { data } = await db
      .from("reactor_settings")
      .select("key, value")
      .in("key", ["EVOLUTION_API_URL", "EVOLUTION_API_KEY"]);

    const settingsMap = Object.fromEntries(
      (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    );
    const url = settingsMap["EVOLUTION_API_URL"] || process.env.EVOLUTION_API_URL || null;
    const key = settingsMap["EVOLUTION_API_KEY"] || process.env.EVOLUTION_API_KEY || null;

    return apiOk({
      configured: !!(url && key),
      url: url ? url.replace(/\/+$/, "") : null,
      hasKey: !!key,
      source: settingsMap["EVOLUTION_API_URL"] ? "database" : (url ? "env" : "none"),
    });
  } catch (err) {
    return apiFail(err);
  }
}

/** POST — salva a config da Evolution API no Supabase */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string | undefined = body?.url?.trim();
    const key: string | undefined = body?.key?.trim();

    if (!url || !key) {
      return apiFail("url e key são obrigatórios", 400);
    }

    const db = getSupabaseAdmin();
    const now = new Date().toISOString();

    await db.from("reactor_settings").upsert([
      { key: "EVOLUTION_API_URL", value: url.replace(/\/+$/, ""), updated_at: now },
      { key: "EVOLUTION_API_KEY", value: key, updated_at: now },
    ]);

    return apiOk({ saved: true });
  } catch (err) {
    return apiFail(err);
  }
}

/** DELETE — remove a config da Evolution API do Supabase */
export async function DELETE() {
  try {
    const db = getSupabaseAdmin();
    await db
      .from("reactor_settings")
      .delete()
      .in("key", ["EVOLUTION_API_URL", "EVOLUTION_API_KEY"]);
    return apiOk({ deleted: true });
  } catch (err) {
    return apiFail(err);
  }
        }
