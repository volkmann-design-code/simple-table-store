import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifySessionToken } from '../utils/jwt';
import { withUserContext } from '../db';
import { LoginPage } from '../views/LoginPage';
import { DashboardPage } from '../views/DashboardPage';
import { DatastorePage } from '../views/DatastorePage';
import { OrgPage } from '../views/OrgPage';
import { enrichRecordWithFileUrls } from '../utils/file-enrichment';
import { getLanguage } from '../i18n';
import type { DataStore, DataRecord, Organization, UserPublic } from '../types';

export const viewRoutes = new Hono();

// Login page
viewRoutes.get('/login', (c) => {
  const error = c.req.query('error');
  const lang = getLanguage(c);
  return c.html(<LoginPage error={error} lang={lang} />);
});

// Handle form logout
viewRoutes.post('/auth/logout', async (c) => {
  const { clearSessionCookie } = await import('../middleware/session');
  clearSessionCookie(c);
  return c.redirect('/login');
});

// Dashboard (requires auth)
viewRoutes.get('/', async (c) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.redirect('/login');
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return c.redirect('/login');
  }

  const datastores = await withUserContext<DataStore[]>(
    session.userId,
    session.orgId,
    async (client) => {
      const result = await client.query('SELECT * FROM datastores ORDER BY name ASC');
      return result.rows;
    }
  );

  const lang = getLanguage(c);
  return c.html(<DashboardPage session={session} datastores={datastores} lang={lang} />);
});

// Organization view
viewRoutes.get('/org', async (c) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.redirect('/login');
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return c.redirect('/login');
  }

  // Check if user has org_id
  if (!session.orgId) {
    return c.redirect('/');
  }

  const result = await withUserContext<{ organization: Organization | null; members: UserPublic[] }>(
    session.userId,
    session.orgId,
    async (client) => {
      // Get organization
      const orgResult = await client.query('SELECT * FROM organizations WHERE id = $1', [session.orgId]);
      const organization = orgResult.rows[0] || null;

      if (!organization) {
        return { organization: null, members: [] };
      }

      // Get all members
      const membersResult = await client.query(
        'SELECT id, org_id, email, created_at, updated_at FROM users WHERE org_id = $1 ORDER BY created_at ASC',
        [session.orgId]
      );

      return {
        organization,
        members: membersResult.rows,
      };
    }
  );

  if (!result.organization) {
    return c.redirect('/');
  }

  const lang = getLanguage(c);
  return c.html(
    <OrgPage
      session={session}
      organization={result.organization}
      members={result.members}
      lang={lang}
    />
  );
});

// Datastore detail view
viewRoutes.get('/datastores/:slug', async (c) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.redirect('/login');
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return c.redirect('/login');
  }

  const slug = c.req.param('slug');
  const page = parseInt(c.req.query('page') || '1');
  const limit = 50;

  const result = await withUserContext<{ datastore: DataStore | null; records: DataRecord[]; total: number }>(
    session.userId,
    session.orgId,
    async (client) => {
      const dsResult = await client.query('SELECT * FROM datastores WHERE slug = $1', [slug]);
      const datastore = dsResult.rows[0] || null;

      if (!datastore) {
        return { datastore: null, records: [], total: 0 };
      }

      const recordsResult = await client.query(
        'SELECT * FROM records WHERE datastore_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [datastore.id, limit, (page - 1) * limit]
      );

      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM records WHERE datastore_id = $1',
        [datastore.id]
      );

      return {
        datastore,
        records: recordsResult.rows,
        total: parseInt(countResult.rows[0].count),
      };
    }
  );

  if (!result.datastore) {
    return c.notFound();
  }

  // Enrich records with file URLs for display
  const enrichedRecords = result.records.map((record) =>
    enrichRecordWithFileUrls(record, result.datastore!, null)
  );

  const lang = getLanguage(c);
  return c.html(
    <DatastorePage
      session={session}
      datastore={result.datastore}
      records={enrichedRecords}
      pagination={{
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      }}
      lang={lang}
    />
  );
});
