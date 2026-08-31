import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { askCopilot, deriveFindings } from "@/lib/ai/copilot";
import { buildSnapshot } from "@/lib/reactor/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Findings only — used to render the copilot panel before anyone asks anything. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(Number(searchParams.get("days") ?? 7) || 7, 90);
    const snapshot = await buildSnapshot(days);
    return apiOk({
      findings: deriveFindings(snapshot),
      snapshot,
      aiEnabled: Boolean(process.env.GROQ_API_KEY),
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: string; days?: number };
    const days = Math.min(Number(body?.days ?? 7) || 7, 90);
    const snapshot = await buildSnapshot(days);
    const result = await askCopilot(body?.question ?? "", snapshot);

    return apiOk({
      ...result,
      aiEnabled: Boolean(process.env.GROQ_API_KEY),
      period: snapshot.period,
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
