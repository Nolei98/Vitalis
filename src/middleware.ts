import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Gate de rotas por sessão. Em edge não há node:crypto, então aqui só checamos a
 * PRESENÇA do cookie (UX); a verificação da assinatura é feita no servidor por
 * getSessionUserId(). Nome do cookie inline de propósito (não importar session.ts,
 * que é server-only). Rotas públicas: /login e /register.
 */
const SESSION_COOKIE = 'lifeos_session';
const PUBLIC = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (hasSession && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Não intercepta API, assets do Next, nem arquivos estáticos.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
