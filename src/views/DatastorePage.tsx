import type { FC } from 'hono/jsx';
import { Layout } from './Layout';
import { t } from '../i18n';
import type { DataStore, DataRecord, SessionPayload } from '../types';

interface DatastorePageProps {
  session: SessionPayload;
  datastore: DataStore;
  records: DataRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  lang?: string;
}

export const DatastorePage: FC<DatastorePageProps> = ({ session, datastore, records, pagination, lang = 'en' }) => {
  const columns = datastore.column_definitions;
  const langCode = lang as 'en' | 'de';

  return (
    <Layout title={`${datastore.name} - Datastore`} lang={lang}>
      <div class="min-h-screen">
        {/* Header */}
        <header class="border-b border-surface-800 bg-surface-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <div class="flex items-center gap-3">
                <a href="/" class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </a>
                <span class="text-surface-500">/</span>
                <span class="font-semibold text-surface-100">{datastore.name}</span>
              </div>

              <div class="flex items-center gap-4">
                <a href="/org" class="text-sm text-surface-400 hover:text-surface-200 transition-colors">
                  {t(langCode, 'org.title')}
                </a>
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
          <div class="flex items-center justify-between mb-6">
            <div>
              <div class="flex items-center gap-2">
                <a href="/" class="text-surface-400 hover:text-surface-200 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </a>
                <h1 class="text-2xl font-bold text-surface-100">{datastore.name}</h1>
              </div>
              {datastore.description && (
                <p class="text-surface-400 mt-1">{datastore.description}</p>
              )}
            </div>
            <button
              type="button"
              class="btn btn-primary"
              onclick="document.getElementById('create-modal').classList.remove('hidden')"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {t(langCode, 'datastore.addRecord')}
            </button>
          </div>

          {/* Records Table */}
          <div class="card p-0 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-surface-700">
                    {columns.map((col) => (
                      <th class="table-header">{col.name}</th>
                    ))}
                    <th class="table-header w-20">{t(langCode, 'common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colspan={columns.length + 1} class="table-cell text-center text-surface-400 py-12">
                        {t(langCode, 'datastore.noRecords')}
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr class="border-b border-surface-800 hover:bg-surface-800/30 transition-colors">
                        {columns.map((col) => (
                          <td class="table-cell text-surface-200">
                            {formatValue(record.data[col.technical_name], col.type)}
                          </td>
                        ))}
                        <td class="table-cell">
                          <div class="flex items-center gap-2">
                            <button
                              type="button"
                              class="p-1.5 text-surface-400 hover:text-primary-400 hover:bg-surface-700 rounded transition-colors"
                              onclick={`openEditModal('${record.id}', ${JSON.stringify(record.data).replace(/'/g, "\\'")})`}
                              title={t(langCode, 'common.edit')}
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <form method="post" action={`/datastores/${datastore.slug}/records/${record.id}/delete`} onsubmit={`return confirm('${t(langCode, 'datastore.deleteConfirm')}')`}>
                              <button
                                type="submit"
                                class="p-1.5 text-surface-400 hover:text-red-400 hover:bg-surface-700 rounded transition-colors"
                                title={t(langCode, 'common.delete')}
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div class="flex items-center justify-between px-4 py-3 border-t border-surface-800">
                <span class="text-sm text-surface-400">
                  {t(langCode, 'common.showing')} {(pagination.page - 1) * pagination.limit + 1} {t(langCode, 'common.to')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t(langCode, 'common.of')} {pagination.total}
                </span>
                <div class="flex gap-2">
                  {pagination.page > 1 && (
                    <a href={`?page=${pagination.page - 1}`} class="btn btn-secondary text-sm">{t(langCode, 'common.previous')}</a>
                  )}
                  {pagination.page < pagination.totalPages && (
                    <a href={`?page=${pagination.page + 1}`} class="btn btn-secondary text-sm">{t(langCode, 'common.next')}</a>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Create/Edit Modal */}
        <div id="create-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="card w-full max-w-lg mx-4">
            <div class="flex items-center justify-between mb-4">
              <h2 id="modal-title" class="text-lg font-semibold text-surface-100">{t(langCode, 'datastore.addRecord')}</h2>
              <button type="button" onclick="closeModal()" class="p-1 text-surface-400 hover:text-surface-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form id="record-form" method="post" action={`/datastores/${datastore.slug}/records`} enctype="multipart/form-data">
              <input type="hidden" id="record-id" name="_id" value="" />
              <input type="hidden" id="form-method" name="_method" value="POST" />
              <div class="space-y-4">
                {columns.map((col) => (
                  <div>
                    <label class="block text-sm font-medium text-surface-300 mb-1.5">
                      {col.name}
                      {col.required && <span class="text-red-400 ml-1">*</span>}
                    </label>
                    {renderInput(col, datastore.slug, langCode)}
                    {col.description && (
                      <p class="text-xs text-surface-500 mt-1">{col.description}</p>
                    )}
                  </div>
                ))}
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" onclick="closeModal()" class="btn btn-secondary">{t(langCode, 'common.cancel')}</button>
                <button type="submit" class="btn btn-primary">{t(langCode, 'common.save')}</button>
              </div>
            </form>
          </div>
        </div>

        {/* Scripts for modal handling */}
        <script dangerouslySetInnerHTML={{ __html: `
          const translations = {
            addRecord: '${t(langCode, 'datastore.addRecord')}',
            editRecord: '${t(langCode, 'datastore.editRecord')}',
            currentFile: '${t(langCode, 'datastore.currentFile')}',
            selectNewFile: '${t(langCode, 'datastore.selectNewFile')}',
          };
          function closeModal() {
            document.getElementById('create-modal').classList.add('hidden');
            document.getElementById('record-form').reset();
            document.getElementById('record-id').value = '';
            document.getElementById('form-method').value = 'POST';
            document.getElementById('modal-title').textContent = translations.addRecord;
            document.getElementById('record-form').action = '/datastores/${datastore.slug}/records';
            
            // Clear all file previews
            document.querySelectorAll('[id^="file-preview-"]').forEach(el => el.innerHTML = '');
            document.querySelectorAll('[id^="file-current-"]').forEach(el => el.innerHTML = '');
          }

          function handleFileInput(fieldName) {
            const input = document.getElementById('file-' + fieldName);
            const preview = document.getElementById('file-preview-' + fieldName);
            if (!input || !preview) return;
            
            const file = input.files?.[0];
            if (file) {
              const maxSize = input.dataset.maxSize ? parseInt(input.dataset.maxSize) : null;
              if (maxSize && file.size > maxSize) {
                preview.innerHTML = '<span class="text-red-400">File size exceeds maximum of ' + formatBytes(maxSize) + '</span>';
                input.value = '';
                return;
              }
              preview.innerHTML = 'Selected: <strong>' + file.name + '</strong> (' + formatBytes(file.size) + ')';
            } else {
              preview.innerHTML = '';
            }
          }
          
          function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
          }

          function openEditModal(id, data) {
            document.getElementById('create-modal').classList.remove('hidden');
            document.getElementById('record-id').value = id;
            document.getElementById('form-method').value = 'PATCH';
            document.getElementById('modal-title').textContent = translations.editRecord;
            document.getElementById('record-form').action = '/datastores/${datastore.slug}/records/' + id;
            
            // Fill form with existing data
            Object.entries(data).forEach(([key, value]) => {
              const input = document.querySelector('[name="' + key + '"]');
              if (input) {
                if (input.type === 'checkbox') {
                  input.checked = value === true || value === 'true';
                } else if (input.type === 'file') {
                  // For file inputs, show current file info
                  const currentFileDiv = document.getElementById('file-current-' + key);
                  if (currentFileDiv && value && typeof value === 'object' && value.file_id) {
                    const fileInfo = value;
                    currentFileDiv.innerHTML = translations.currentFile + ' <a href="' + (fileInfo.url || '#') + '" target="_blank" class="text-primary-400 hover:text-primary-300 underline">' + (fileInfo.filename || 'File') + '</a> (' + formatBytes(fileInfo.size || 0) + '). ' + translations.selectNewFile;
                  } else if (currentFileDiv) {
                    currentFileDiv.innerHTML = '';
                  }
                } else {
                  input.value = value ?? '';
                }
              }
            });
          }

          // Close modal on escape key
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
          });

          // Close modal on backdrop click
          document.getElementById('create-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
          });
        ` }} />
      </div>
    </Layout>
  );
};

function formatValue(value: unknown, type: string): string | any {
  if (value === null || value === undefined) return '-';
  if (type === 'boolean') return value ? '✓' : '✗';
  if (type === 'date') {
    const date = new Date(value as string);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }
  if (type === 'file' && typeof value === 'object' && value !== null && 'file_id' in value) {
    const fileRef = value as { filename?: string; url?: string };
    return (
      <a href={fileRef.url || '#'} class="text-primary-400 hover:text-primary-300 underline" target="_blank" rel="noopener noreferrer">
        {fileRef.filename || 'File'}
      </a>
    );
  }
  return String(value);
}

function renderInput(col: DataStore['column_definitions'][0], slug: string, lang: 'en' | 'de') {
  const baseClass = 'input';
  const required = col.required ? 'required' : '';

  switch (col.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          name={col.technical_name}
          class="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500"
        />
      );
    case 'number':
      return (
        <input
          type="number"
          name={col.technical_name}
          class={baseClass}
          min={col.validation?.min}
          max={col.validation?.max}
          required={col.required}
          step="any"
        />
      );
    case 'date':
      return (
        <input
          type="date"
          name={col.technical_name}
          class={baseClass}
          required={col.required}
        />
      );
    case 'select':
      return (
        <select name={col.technical_name} class={baseClass} required={col.required}>
          <option value="">{t(lang, 'common.select')}</option>
          {col.options?.map((opt) => (
            <option value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'file':
      return (
        <div>
          <input
            type="file"
            name={col.technical_name}
            id={`file-${col.technical_name}`}
            class={baseClass}
            required={col.required}
            accept={col.validation?.allowedContentTypes?.join(',')}
            data-max-size={col.validation?.maxFileSize}
            onchange={`handleFileInput('${col.technical_name}')`}
          />
          <div id={`file-preview-${col.technical_name}`} class="mt-2 text-sm text-surface-400"></div>
          <div id={`file-current-${col.technical_name}`} class="mt-2 text-sm text-surface-400"></div>
        </div>
      );
    default:
      return (
        <input
          type="text"
          name={col.technical_name}
          class={baseClass}
          pattern={col.validation?.pattern}
          required={col.required}
        />
      );
  }
}
