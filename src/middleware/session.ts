import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { verifySessionToken, createSessionToken } from '../utils/jwt';
import { tFromContext } from '../i18n';
import type { SessionPayload } from '../types';

declare module 'hono' {
  interface ContextVariableMap {
    session: SessionPayload;
  }
}

const COOKIE_NAME = 'session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 24 * 60 * 60, // 24 hours
};

export const sessionAuth = createMiddleware(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);

  if (!token) {
    return c.json({ error: tFromContext(c, 'errors.notAuthenticated') }, 401);
  }

  const session = await verifySessionToken(token);

  if (!session) {
    deleteCookie(c, COOKIE_NAME);
    return c.json({ error: tFromContext(c, 'errors.invalidSession') }, 401);
  }

  // Sliding session: refresh if more than halfway through
  const now = Math.floor(Date.now() / 1000);
  const halfLife = 12 * 60 * 60; // 12 hours
  if (session.exp - now < halfLife) {
    const newToken = await createSessionToken({
      userId: session.userId,
      orgId: session.orgId,
      email: session.email,
    });
    setCookie(c, COOKIE_NAME, newToken, COOKIE_OPTIONS);
  }

  c.set('session', session);
  await next();
});

export async function setSessionCookie(
  c: Parameters<typeof setCookie>[0],
  payload: Omit<SessionPayload, 'exp'>
) {
  const token = await createSessionToken(payload);
  setCookie(c, COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function clearSessionCookie(c: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(c, COOKIE_NAME);
}
