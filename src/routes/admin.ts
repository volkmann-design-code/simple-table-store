import { Hono } from 'hono';
import { adminAuth } from '../middleware/admin';
import { adminQuery, adminQueryOne } from '../db';
import { hashPassword } from '../utils/password';
import { generateApiKey } from '../utils/apikey';
import { tFromContext } from '../i18n';
import type { Organization, User, UserPublic, DataStore, ApiKey, ColumnDefinition } from '../types';

export const adminRoutes = new Hono();

// All admin routes require admin token
adminRoutes.use('*', adminAuth);

// === Organizations ===

adminRoutes.get('/orgs', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const orgs = await adminQuery<Organization>(
    'SELECT * FROM organizations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const [{ count }] = await adminQuery<{ count: string }>(
    'SELECT COUNT(*) as count FROM organizations'
  );

  return c.json({
    data: orgs,
    total: parseInt(count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(count) / limit),
  });
});

adminRoutes.post('/orgs', async (c) => {
  const body = await c.req.json<{ name: string }>();

  if (!body.name) {
    return c.json({ error: tFromContext(c, 'errors.nameRequired') }, 400);
  }

  const org = await adminQueryOne<Organization>(
    'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
    [body.name]
  );

  return c.json(org, 201);
});

adminRoutes.get('/orgs/:id', async (c) => {
  const id = c.req.param('id');
  const org = await adminQueryOne<Organization>(
    'SELECT * FROM organizations WHERE id = $1',
    [id]
  );

  if (!org) {
    return c.json({ error: tFromContext(c, 'errors.orgNotFound') }, 404);
  }

  return c.json(org);
});

adminRoutes.patch('/orgs/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ name?: string }>();

  const org = await adminQueryOne<Organization>(
    'UPDATE organizations SET name = COALESCE($1, name), updated_at = NOW() WHERE id = $2 RETURNING *',
    [body.name, id]
  );

  if (!org) {
    return c.json({ error: tFromContext(c, 'errors.orgNotFound') }, 404);
  }

  return c.json(org);
});

adminRoutes.delete('/orgs/:id', async (c) => {
  const id = c.req.param('id');
  const result = await adminQuery(
    'DELETE FROM organizations WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.length === 0) {
    return c.json({ error: tFromContext(c, 'errors.orgNotFound') }, 404);
  }

  return c.body(null, 204);
});

// === Users ===

function toUserPublic(user: User): UserPublic {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

adminRoutes.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;
  const orgId = c.req.query('org_id');

  let query = 'SELECT * FROM users';
  const params: unknown[] = [];

  if (orgId) {
    query += ' WHERE org_id = $1';
    params.push(orgId);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const users = await adminQuery<User>(query, params);

  let countQuery = 'SELECT COUNT(*) as count FROM users';
  const countParams: unknown[] = [];
  if (orgId) {
    countQuery += ' WHERE org_id = $1';
    countParams.push(orgId);
  }

  const [{ count }] = await adminQuery<{ count: string }>(countQuery, countParams);

  return c.json({
    data: users.map(toUserPublic),
    total: parseInt(count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(count) / limit),
  });
});

adminRoutes.post('/users', async (c) => {
  const body = await c.req.json<{ email: string; password: string; org_id: string }>();

  if (!body.email || !body.password || !body.org_id) {
    return c.json({ error: tFromContext(c, 'errors.emailPasswordOrgRequired') }, 400);
  }

  const passwordHash = await hashPassword(body.password);

  try {
    const user = await adminQueryOne<User>(
      'INSERT INTO users (email, password_hash, org_id) VALUES ($1, $2, $3) RETURNING *',
      [body.email, passwordHash, body.org_id]
    );

    return c.json(toUserPublic(user!), 201);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') {
      return c.json({ error: tFromContext(c, 'errors.emailExists') }, 409);
    }
    throw e;
  }
});

adminRoutes.get('/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = await adminQueryOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  if (!user) {
    return c.json({ error: tFromContext(c, 'errors.userNotFound') }, 404);
  }

  return c.json(toUserPublic(user));
});

adminRoutes.patch('/users/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ email?: string; password?: string; org_id?: string }>();

  let passwordHash: string | undefined;
  if (body.password) {
    passwordHash = await hashPassword(body.password);
  }

  const user = await adminQueryOne<User>(
    `UPDATE users SET 
      email = COALESCE($1, email),
      password_hash = COALESCE($2, password_hash),
      org_id = COALESCE($3, org_id),
      updated_at = NOW()
    WHERE id = $4 RETURNING *`,
    [body.email, passwordHash, body.org_id, id]
  );

  if (!user) {
    return c.json({ error: tFromContext(c, 'errors.userNotFound') }, 404);
  }

  return c.json(toUserPublic(user));
});

adminRoutes.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  const result = await adminQuery(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.length === 0) {
    return c.json({ error: tFromContext(c, 'errors.userNotFound') }, 404);
  }

  return c.body(null, 204);
});

// === DataStores ===

adminRoutes.get('/datastores', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;
  const orgId = c.req.query('org_id');

  let query = 'SELECT * FROM datastores';
  const params: unknown[] = [];

  if (orgId) {
    query += ' WHERE org_id = $1';
    params.push(orgId);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const datastores = await adminQuery<DataStore>(query, params);

  let countQuery = 'SELECT COUNT(*) as count FROM datastores';
  const countParams: unknown[] = [];
  if (orgId) {
    countQuery += ' WHERE org_id = $1';
    countParams.push(orgId);
  }

  const [{ count }] = await adminQuery<{ count: string }>(countQuery, countParams);

  return c.json({
    data: datastores,
    total: parseInt(count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(count) / limit),
  });
});

adminRoutes.post('/datastores', async (c) => {
  const body = await c.req.json<{
    org_id: string;
    name: string;
    slug: string;
    description?: string;
    column_definitions: ColumnDefinition[];
  }>();

  if (!body.org_id || !body.name || !body.slug || !body.column_definitions) {
    return c.json({ error: tFromContext(c, 'errors.datastoreRequired') }, 400);
  }

  try {
    const datastore = await adminQueryOne<DataStore>(
      `INSERT INTO datastores (org_id, name, slug, description, column_definitions) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.org_id, body.name, body.slug, body.description || null, JSON.stringify(body.column_definitions)]
    );

    return c.json(datastore, 201);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') {
      return c.json({ error: tFromContext(c, 'errors.slugExists') }, 409);
    }
    throw e;
  }
});

adminRoutes.get('/datastores/:id', async (c) => {
  const id = c.req.param('id');
  const datastore = await adminQueryOne<DataStore>(
    'SELECT * FROM datastores WHERE id = $1',
    [id]
  );

  if (!datastore) {
    return c.json({ error: tFromContext(c, 'errors.datastoreNotFound') }, 404);
  }

  return c.json(datastore);
});

adminRoutes.patch('/datastores/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    name?: string;
    slug?: string;
    description?: string;
    column_definitions?: ColumnDefinition[];
  }>();

  const datastore = await adminQueryOne<DataStore>(
    `UPDATE datastores SET 
      name = COALESCE($1, name),
      slug = COALESCE($2, slug),
      description = COALESCE($3, description),
      column_definitions = COALESCE($4, column_definitions),
      updated_at = NOW()
    WHERE id = $5 RETURNING *`,
    [
      body.name,
      body.slug,
      body.description,
      body.column_definitions ? JSON.stringify(body.column_definitions) : null,
      id,
    ]
  );

  if (!datastore) {
    return c.json({ error: tFromContext(c, 'errors.datastoreNotFound') }, 404);
  }

  return c.json(datastore);
});

adminRoutes.delete('/datastores/:id', async (c) => {
  const id = c.req.param('id');
  const result = await adminQuery(
    'DELETE FROM datastores WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.length === 0) {
    return c.json({ error: tFromContext(c, 'errors.datastoreNotFound') }, 404);
  }

  return c.body(null, 204);
});

// === API Keys ===

adminRoutes.get('/api-keys', async (c) => {
  const datastoreId = c.req.query('datastore_id');

  if (!datastoreId) {
    return c.json({ error: tFromContext(c, 'errors.datastoreIdRequired') }, 400);
  }

  const keys = await adminQuery<Omit<ApiKey, 'key_hash'>>(
    'SELECT id, datastore_id, name, created_at, expires_at FROM api_keys WHERE datastore_id = $1 ORDER BY created_at DESC',
    [datastoreId]
  );

  return c.json({ data: keys });
});

adminRoutes.post('/api-keys', async (c) => {
  const body = await c.req.json<{
    datastore_id: string;
    name: string;
    expires_at?: string;
  }>();

  if (!body.datastore_id || !body.name) {
    return c.json({ error: tFromContext(c, 'errors.datastoreIdNameRequired') }, 400);
  }

  const { key, hash } = generateApiKey();

  const apiKey = await adminQueryOne<ApiKey>(
    `INSERT INTO api_keys (datastore_id, key_hash, name, expires_at) 
     VALUES ($1, $2, $3, $4) RETURNING id, datastore_id, name, created_at, expires_at`,
    [body.datastore_id, hash, body.name, body.expires_at || null]
  );

  // Return the plaintext key only on creation
  return c.json({ ...apiKey, key }, 201);
});

adminRoutes.delete('/api-keys/:id', async (c) => {
  const id = c.req.param('id');
  const result = await adminQuery(
    'DELETE FROM api_keys WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.length === 0) {
    return c.json({ error: tFromContext(c, 'errors.apiKeyNotFound') }, 404);
  }

  return c.body(null, 204);
});

// === Migrations ===

adminRoutes.post('/migrate', async (c) => {
  try {
    const { migrate } = await import('../db/migrate');
    const result = await migrate();
    return c.json({
      success: true,
      message: 'Migrations completed',
      applied: result.applied,
      skipped: result.skipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Migration failed';
    console.error('Migration error:', error);
    return c.json(
      {
        success: false,
        error: message,
      },
      500
    );
  }
});

adminRoutes.get('/migrate/status', async (c) => {
  try {
    const { readdir } = await import('fs/promises');
    const { adminQuery } = await import('../db');
    const { MIGRATIONS_DIR } = await import('../db/migrate');
    const files = await readdir(MIGRATIONS_DIR);
    const allMigrations = files
      .filter((f) => f.endsWith('.sql'))
      .map((f) => f.replace('.sql', ''))
      .sort();

    const appliedResult = await adminQuery<{ version: string }>(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    const applied = new Set(appliedResult.map((r) => r.version));

    const status = allMigrations.map((version) => ({
      version,
      applied: applied.has(version),
    }));

    return c.json({
      migrations: status,
      total: allMigrations.length,
      applied: applied.size,
      pending: allMigrations.length - applied.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get migration status';
    return c.json(
      {
        error: message,
      },
      500
    );
  }
});
