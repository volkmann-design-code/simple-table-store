import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { languageDetector } from 'hono/language';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { apiRoutes } from './routes/api';
import { viewRoutes } from './routes/views';
import { fileRoutes } from './routes/files';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  languageDetector({
    supportedLanguages: ['en', 'de'],
    fallbackLanguage: 'en',
  })
);

// Static files
app.use('/dist/*', serveStatic({ root: './' }));

// Routes
app.route('/admin', adminRoutes);
app.route('/auth', authRoutes);
app.route('/api', apiRoutes);
app.route('/api', fileRoutes);
app.route('/', viewRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = parseInt(process.env.PORT || '3000');
console.log(`🚀 Datastore App running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
