import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Gate de rotas por sessão.
 * Se o usuário tiver o cookie lifeos_session (autenticado):
 *   - Qualquer tentativa de acessar /, /login ou /register redireciona para /dashboard
 * Se o usuário NÃO tiver a sessão:
 *   - Acesso livre para /, /login, /register e /termos
 *   - Qualquer outra rota redireciona para /login
 */
const SESSION_COOKIE = 'lifeos_session';
const PUBLIC_PREFIXES = ['/login', '/register', '/termos'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;

  const isExactRoot = pathname === '/';
  const isPublic = isExactRoot || PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // Se logado e acessando rotas de entrada/landing -> vai pro Dashboard
  if (hasSession && (isExactRoot || pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Se não logado e acessando rota protegida -> vai para /login
  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Não intercepta API, assets do Next, nem arquivos estáticos.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
