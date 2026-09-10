import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isAuthConfigured, verifySessionToken } from "@/lib/auth/session";

/**
 * Portao de acesso do Reactor.
 *
 * Sem isto todas as telas e todas as rotas /api ficam publicas para quem
 * souber a URL — e /api/board devolve nome, telefone, e-mail e valor de cada
 * lead. Numa clinica isso e dado de paciente.
 *
 * O middleware roda antes de qualquer rota: nenhuma pagina ou API nova nasce
 * desprotegida por esquecimento.
 */

/** O webhook e chamado pelo Evolution, que nao tem como fazer login. */
const WEBHOOK_PATH = "/api/webhook/";

/** Rotas que precisam responder para quem ainda nao entrou. */
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function unauthorized(request: NextRequest): NextResponse {
  // Uma API responde 401; uma tela leva a pessoa ao login e volta depois.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Nao autenticado" },
      { status: 401 }
    );
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  /**
   * O webhook tem autenticacao propria (o token conferido na rota), porque o
   * Evolution nao carrega cookie de sessao. Deixa-lo passar aqui e proposital.
   */
  if (pathname.startsWith(WEBHOOK_PATH)) return NextResponse.next();

  /**
   * Sem REACTOR_ACCESS_PASSWORD nao ha portao possivel. Fechar tudo deixaria o
   * sistema inutilizavel e sem explicacao; entao respondemos com o motivo, em
   * vez de abrir a porta em silencio ou dar um erro que ninguem entende.
   */
  if (!isAuthConfigured()) {
    const message =
      "REACTOR_ACCESS_PASSWORD nao esta definida. Defina a senha de acesso da " +
      "equipe nas variaveis de ambiente para liberar o sistema.";
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: message }, { status: 503 });
    }
    return new NextResponse(message, {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  return unauthorized(request);
}

export const config = {
  /**
   * Tudo, menos os arquivos estaticos do proprio Next e o favicon — pedir
   * login para um chunk de JS quebraria a tela de login.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
