import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  if (!request.cookies.get('vid')) {
    const vid = crypto.randomUUID();
    response.cookies.set('vid', vid, {
      maxAge: 60 * 60 * 6, // 6 horas
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
