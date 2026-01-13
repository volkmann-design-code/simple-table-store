import { sign, verify } from 'hono/jwt';
import type { SessionPayload } from '../types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

export async function createSessionToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  return await sign({ ...payload, exp }, SESSION_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const payload = await verify(token, SESSION_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
