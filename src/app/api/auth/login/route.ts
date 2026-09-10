import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isAuthConfigured,
  verifyPassword,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** Troca a senha da equipe por um cookie de sessao assinado. */
export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "REACTOR_ACCESS_PASSWORD nao configurada no servidor." },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body?.password ?? "";
  } catch {
    // Corpo invalido cai no mesmo "senha incorreta" abaixo.
  }

  if (!(await verifyPassword(password))) {
    // Atraso curto para tornar tentativa em massa desinteressante sem
    // atrapalhar quem so errou a digitacao.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json(
      { ok: false, error: "Senha incorreta." },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel emitir a sessao." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true, data: { authenticated: true } });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, // fora do alcance de qualquer script na pagina
    sameSite: "lax", // nao viaja em requisicao de outro site
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
