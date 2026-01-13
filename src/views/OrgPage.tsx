import type { FC } from 'hono/jsx';
import { Layout } from './Layout';
import { t } from '../i18n';
import type { Organization, UserPublic, SessionPayload } from '../types';

interface OrgPageProps {
  session: SessionPayload;
  organization: Organization;
  members: UserPublic[];
  lang?: string;
  logoUrl?: string;
  appTitle?: string;
}

const DefaultLogoIcon = () => (
  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
  </svg>
);

export const OrgPage: FC<OrgPageProps> = ({ session, organization, members, lang = 'en', logoUrl, appTitle = 'Datastore' }) => {
  const langCode = lang as 'en' | 'de';

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  };

  const formatDateFallback = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(langCode === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeFallback = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? (langCode === 'de' ? 'Tag' : 'day') : (langCode === 'de' ? 'Tage' : 'days')} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? (langCode === 'de' ? 'Stunde' : 'hour') : (langCode === 'de' ? 'Stunden' : 'hours')} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? (langCode === 'de' ? 'Minute' : 'minute') : (langCode === 'de' ? 'Minuten' : 'minutes')} ago`;
    } else {
      return langCode === 'de' ? 'gerade eben' : 'just now';
    }
  };

  return (
    <Layout title={`${organization.name} - Organization`} lang={lang} appTitle={appTitle}>
      <div class="min-h-screen">
        {/* Header */}
        <header class="border-b border-surface-800 bg-surface-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center gap-3">
                <a href="/" class={logoUrl ? "w-8 h-8 hover:opacity-80 transition-opacity" : "w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"}>
                  {logoUrl ? (
                    <img src={logoUrl} alt={appTitle} class="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <DefaultLogoIcon />
                  )}
                </a>
                <span class="text-surface-500">/</span>
                <span class="font-semibold text-surface-100">{organization.name}</span>
              </div>

              <div class="flex items-center gap-4">
                <span class="text-sm text-surface-400">{session.email}</span>
                <form method="post" action="/auth/logout">
                  <button type="submit" class="text-sm text-surface-400 hover:text-surface-200 transition-colors">
                    {t(langCode, 'common.signOut')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-surface-100">{t(langCode, 'org.title')}</h1>
            <p class="text-surface-400 mt-1">{t(langCode, 'org.subtitle')}</p>
          </div>

          {/* Read-only notice */}
          <div class="mb-6 card bg-surface-800/50 border-surface-700">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-surface-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-surface-300">{t(langCode, 'org.readOnlyNotice')}</p>
            </div>
          </div>

          {/* Organization Metadata */}
          <div class="card mb-6">
            <h2 class="text-lg font-semibold text-surface-100 mb-4">{t(langCode, 'org.title')}</h2>
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt class="text-sm font-medium text-surface-400">{t(langCode, 'org.name')}</dt>
                <dd class="mt-1 text-sm text-surface-100">{organization.name}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-surface-400">{t(langCode, 'org.createdAt')}</dt>
                <dd class="mt-1 text-sm text-surface-100">
                  <relative-time datetime={formatDateTime(organization.created_at)} format="datetime" lang={lang}>
                    {formatDateFallback(organization.created_at)}
                  </relative-time>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-surface-400">{t(langCode, 'org.updatedAt')}</dt>
                <dd class="mt-1 text-sm text-surface-100">
                  <relative-time datetime={formatDateTime(organization.updated_at)} format="datetime" lang={lang}>
                    {formatDateFallback(organization.updated_at)}
                  </relative-time>
                </dd>
              </div>
            </dl>
          </div>

          {/* Members Table */}
          <div class="card">
            <h2 class="text-lg font-semibold text-surface-100 mb-4">{t(langCode, 'org.members')}</h2>
            {members.length === 0 ? (
              <p class="text-surface-400 text-sm">{t(langCode, 'org.noOrgAccess')}</p>
            ) : (
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-surface-700">
                  <thead>
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                        {t(langCode, 'org.memberEmail')}
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                        {t(langCode, 'org.memberSince')}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-700">
                    {members.map((member) => (
                      <tr key={member.id} class={member.id === session.userId ? 'bg-surface-800/30' : ''}>
                        <td class="px-4 py-3 text-left text-sm text-surface-100">
                          {member.email}
                          {member.id === session.userId && (
                            <span class="ml-2 text-xs text-surface-400">({t(langCode, 'org.you')})</span>
                          )}
                        </td>
                        <td class="px-4 py-3 text-left text-sm text-surface-400">
                          <relative-time datetime={formatDateTime(member.created_at)} format="relative" lang={lang}>
                            {formatRelativeFallback(member.created_at)}
                          </relative-time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};
