import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifySessionToken } from '../utils/jwt';
import { withUserContext } from '../db';
import { LoginPage } from '../views/LoginPage';
import { DashboardPage } from '../views/DashboardPage';
import { DatastorePage } from '../views/DatastorePage';
import { OrgPage } from '../views/OrgPage';
import { getLanguage, tFromContext } from '../i18n';
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

  const lang = getLanguage(c);
  return c.html(
    <DatastorePage
      session={session}
      datastore={result.datastore}
      records={result.records}
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

// Create record from form
viewRoutes.post('/datastores/:slug/records', async (c) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.redirect('/login');
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return c.redirect('/login');
  }

  const slug = c.req.param('slug');
  const body = await c.req.parseBody();

  // Build data object from form fields (excluding internal fields)
  const data: Record<string, unknown> = {};
  const files: Map<string, File> = new Map();
  
  for (const [key, value] of Object.entries(body)) {
    if (!key.startsWith('_')) {
      if (value instanceof File) {
        files.set(key, value);
      } else {
        data[key] = value === '' ? null : value;
      }
    }
  }

  const { validateRecordData } = await import('../utils/validation');
  const { uploadFile, S3_BUCKET } = await import('../utils/s3');
  const { randomUUID } = await import('crypto');

  await withUserContext(
    session.userId,
    session.orgId,
    async (client) => {
      const dsResult = await client.query('SELECT * FROM datastores WHERE slug = $1', [slug]);
      const datastore = dsResult.rows[0] as DataStore;

      if (!datastore) {
        throw new Error('Datastore not found');
      }

      // Handle file uploads
      if (S3_BUCKET) {
        for (const [fieldName, file] of files.entries()) {
          const column = datastore.column_definitions.find((col) => col.technical_name === fieldName);
          if (column && column.type === 'file') {
            // Validate file size
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            if (column.validation?.maxFileSize && buffer.length > column.validation.maxFileSize) {
              throw new Error(tFromContext(c, 'errors.fileSizeExceeded', { name: column.name, maxSize: String(column.validation.maxFileSize) }));
            }

            // Validate content type
            if (column.validation?.allowedContentTypes && !column.validation.allowedContentTypes.includes(file.type)) {
              throw new Error(tFromContext(c, 'errors.invalidContentType', { name: column.name, allowed: column.validation.allowedContentTypes.join(', ') }));
            }

            // Upload to S3
            const fileId = randomUUID();
            const objectKey = `datastores/${datastore.id}/${fileId}`;
            await uploadFile(objectKey, buffer, file.type);

            // Create file record
            await client.query(
              `INSERT INTO files (id, datastore_id, object_key, filename, content_type, size_bytes, created_by_user_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [fileId, datastore.id, objectKey, file.name, file.type, buffer.length, session.userId]
            );

            // Store file reference in data
            data[fieldName] = {
              file_id: fileId,
              filename: file.name,
              content_type: file.type,
              size: buffer.length,
            };
          }
        }
      }

      // Handle checkbox fields (unchecked checkboxes don't send values)
      for (const col of datastore.column_definitions) {
        if (col.type === 'boolean') {
          data[col.technical_name] = data[col.technical_name] === 'on' || data[col.technical_name] === 'true';
        }
      }

      const lang = getLanguage(c);
      const errors = validateRecordData(data, datastore.column_definitions, lang);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(', '));
      }

      await client.query(
        'INSERT INTO records (datastore_id, data) VALUES ($1, $2)',
        [datastore.id, JSON.stringify(data)]
      );
    }
  );

  return c.redirect(`/datastores/${slug}`);
});

// Update record from form
viewRoutes.post('/datastores/:slug/records/:id', async (c) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.redirect('/login');
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return c.redirect('/login');
  }

  const slug = c.req.param('slug');
  const recordId = c.req.param('id');
  const body = await c.req.parseBody();

  // Build data object from form fields
  const data: Record<string, unknown> = {};
  const files: Map<string, File> = new Map();
  
  for (const [key, value] of Object.entries(body)) {
    if (!key.startsWith('_')) {
      if (value instanceof File) {
        files.set(key, value);
      } else {
        data[key] = value === '' ? null : value;
      }
    }
  }

  const { validateRecordData } = await import('../utils/validation');
  const { uploadFile, deleteFile, S3_BUCKET } = await import('../utils/s3');
  const { randomUUID } = await import('crypto');

  await withUserContext(
    session.userId,
    session.orgId,
    async (client) => {
      const dsResult = await client.query('SELECT * FROM datastores WHERE slug = $1', [slug]);
      const datastore = dsResult.rows[0] as DataStore;

      if (!datastore) {
        throw new Error(tFromContext(c, 'errors.datastoreNotFound'));
      }

      // Get existing record
      const existingResult = await client.query(
        'SELECT * FROM records WHERE id = $1 AND datastore_id = $2',
        [recordId, datastore.id]
      );

      if (existingResult.rows.length === 0) {
        throw new Error(tFromContext(c, 'errors.recordNotFound'));
      }

      const existing = existingResult.rows[0] as DataRecord;
      const mergedData = { ...existing.data };

      // Handle file uploads
      if (S3_BUCKET) {
        for (const [fieldName, file] of files.entries()) {
          const column = datastore.column_definitions.find((col) => col.technical_name === fieldName);
          if (column && column.type === 'file') {
            // Delete old file if exists
            const oldFileValue = mergedData[fieldName];
            if (oldFileValue && typeof oldFileValue === 'object' && 'file_id' in oldFileValue) {
              const oldFileId = (oldFileValue as { file_id: string }).file_id;
              const oldFileResult = await client.query('SELECT object_key FROM files WHERE id = $1', [oldFileId]);
              if (oldFileResult.rows.length > 0) {
                const objectKey = oldFileResult.rows[0].object_key;
                try {
                  await deleteFile(objectKey);
                } catch (error) {
                  console.error('Failed to delete old file from S3:', error);
                }
                await client.query('DELETE FROM files WHERE id = $1', [oldFileId]);
              }
            }

            // Validate and upload new file
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            if (column.validation?.maxFileSize && buffer.length > column.validation.maxFileSize) {
              throw new Error(tFromContext(c, 'errors.fileSizeExceeded', { name: column.name, maxSize: String(column.validation.maxFileSize) }));
            }

            if (column.validation?.allowedContentTypes && !column.validation.allowedContentTypes.includes(file.type)) {
              throw new Error(tFromContext(c, 'errors.invalidContentType', { name: column.name, allowed: column.validation.allowedContentTypes.join(', ') }));
            }

            // Upload to S3
            const fileId = randomUUID();
            const objectKey = `datastores/${datastore.id}/${fileId}`;
            await uploadFile(objectKey, buffer, file.type);

            // Create file record
            await client.query(
              `INSERT INTO files (id, datastore_id, object_key, filename, content_type, size_bytes, created_by_user_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [fileId, datastore.id, objectKey, file.name, file.type, buffer.length, session.userId]
            );

            // Store file reference in data
            mergedData[fieldName] = {
              file_id: fileId,
              filename: file.name,
              content_type: file.type,
              size: buffer.length,
            };
          }
        }
      }

      // Merge other fields
      Object.assign(mergedData, data);

      // Handle checkbox fields
      for (const col of datastore.column_definitions) {
        if (col.type === 'boolean') {
          mergedData[col.technical_name] = mergedData[col.technical_name] === 'on' || mergedData[col.technical_name] === 'true';
        }
      }

      const lang = getLanguage(c);
      const errors = validateRecordData(mergedData, datastore.column_definitions, lang);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(', '));
      }

      await client.query(
        'UPDATE records SET data = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(mergedData), recordId]
      );
    }
  );

  return c.redirect(`/datastores/${slug}`);
});

// Delete record from form
viewRoutes.post('/datastores/:slug/records/:id/delete', async (c) => {
  const token = getCookie(c, 'session');

  if (!token) {
    return c.redirect('/login');
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return c.redirect('/login');
  }

  const slug = c.req.param('slug');
  const recordId = c.req.param('id');

  const { deleteFile, S3_BUCKET } = await import('../utils/s3');

  await withUserContext(
    session.userId,
    session.orgId,
    async (client) => {
      const dsResult = await client.query('SELECT * FROM datastores WHERE slug = $1', [slug]);
      const datastore = dsResult.rows[0] as DataStore;

      if (!datastore) {
        throw new Error(tFromContext(c, 'errors.datastoreNotFound'));
      }

      // Get record to find associated files
      const recordResult = await client.query(
        'SELECT data FROM records WHERE id = $1 AND datastore_id = $2',
        [recordId, datastore.id]
      );

      if (recordResult.rows.length === 0) {
        throw new Error(tFromContext(c, 'errors.recordNotFound'));
      }

      const record = recordResult.rows[0] as DataRecord;

      // Delete associated files
      if (S3_BUCKET) {
        for (const column of datastore.column_definitions) {
          if (column.type === 'file') {
            const fileValue = record.data[column.technical_name];
            if (fileValue && typeof fileValue === 'object' && 'file_id' in fileValue) {
              const fileId = (fileValue as { file_id: string }).file_id;
              const fileResult = await client.query('SELECT object_key FROM files WHERE id = $1', [fileId]);
              if (fileResult.rows.length > 0) {
                const objectKey = fileResult.rows[0].object_key;
                try {
                  await deleteFile(objectKey);
                } catch (error) {
                  console.error('Failed to delete file from S3:', error);
                }
                await client.query('DELETE FROM files WHERE id = $1', [fileId]);
              }
            }
          }
        }
      }

      await client.query(
        'DELETE FROM records WHERE id = $1 AND datastore_id = $2',
        [recordId, datastore.id]
      );
    }
  );

  return c.redirect(`/datastores/${slug}`);
});
