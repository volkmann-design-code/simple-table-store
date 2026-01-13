import { Hono } from 'hono';
import { adminQueryOne } from '../db';
import { verifyPassword } from '../utils/password';
import { setSessionCookie, clearSessionCookie, sessionAuth } from '../middleware/session';
import { tFromContext } from '../i18n';
import type { User } from '../types';

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  // Handle both JSON and form data
  const contentType = c.req.header('Content-Type') || '';
  const isFormData = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
  let email: string;
  let password: string;

  if (contentType.includes('application/json')) {
    const body = await c.req.json<{ email: string; password: string }>();
    email = body.email;
    password = body.password;
  } else {
    // Form data
    const body = await c.req.parseBody();
    email = body.email as string;
    password = body.password as string;
  }

  if (!email || !password) {
    const errorMsg = tFromContext(c, 'errors.emailPasswordRequired');
    if (isFormData) {
      return c.redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
    }
    return c.json({ error: errorMsg }, 400);
  }

  const user = await adminQueryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    const errorMsg = tFromContext(c, 'errors.invalidCredentials');
    if (isFormData) {
      return c.redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
    }
    return c.json({ error: errorMsg }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    const errorMsg = tFromContext(c, 'errors.invalidCredentials');
    if (isFormData) {
      return c.redirect(`/login?error=${encodeURIComponent(errorMsg)}`);
    }
    return c.json({ error: errorMsg }, 401);
  }

  await setSessionCookie(c, {
    userId: user.id,
    orgId: user.org_id,
    email: user.email,
  });

  if (isFormData) {
    return c.redirect('/');
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      org_id: user.org_id,
    },
  });
});

authRoutes.post('/logout', sessionAuth, async (c) => {
  clearSessionCookie(c);
  return c.json({ success: true });
});

authRoutes.get('/me', sessionAuth, async (c) => {
  const session = c.get('session');
  return c.json({
    user: {
      id: session.userId,
      email: session.email,
      org_id: session.orgId,
    },
  });
});
