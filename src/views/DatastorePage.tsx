import type { FC } from "hono/jsx";
import { t } from "../i18n";
import type { DataRecord, DataStore, SessionPayload } from "../types";
import { getAcceptAttribute } from "../utils/file-presets";
import { SettingsIcon, SortAscIcon, SortDescIcon } from "./components/Icons";
import { Navbar } from "./components/Navbar";
import { Layout } from "./Layout";

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
	sort?: {
		field: string;
		order: "asc" | "desc";
	};
	lang?: string;
	logoUrl?: string;
	appTitle?: string;
}

// Helper to build URL with sort and pagination params
function buildUrl(
	baseParams: { page?: number; sort?: string; order?: string },
	currentSort?: { field: string; order: "asc" | "desc" },
): string {
	const params = new URLSearchParams();
	if (baseParams.page && baseParams.page > 1) {
		params.set("page", String(baseParams.page));
	}
	const sortField = baseParams.sort ?? currentSort?.field;
	const sortOrder = baseParams.order ?? currentSort?.order;
	if (sortField && sortField !== "created_at") {
		params.set("sort", sortField);
	}
	if (sortOrder && sortOrder !== "desc") {
		params.set("order", sortOrder);
	}
	const queryString = params.toString();
	return queryString ? `?${queryString}` : "";
}

// Check if content type is an image
function isImageType(contentType?: string): boolean {
	return contentType?.startsWith("image/") ?? false;
}

// Check if content type is a video
function isVideoType(contentType?: string): boolean {
	return contentType?.startsWith("video/") ?? false;
}

export const DatastorePage: FC<DatastorePageProps> = ({
	session,
	datastore,
	records,
	pagination,
	sort = { field: "created_at", order: "desc" },
	lang = "en",
	logoUrl,
	appTitle = "Datastore",
}) => {
	const columns = datastore.column_definitions;
	const langCode = lang as "en" | "de";

	// Build sort URL for a column
	const getSortUrl = (column: string) => {
		const newOrder =
			sort.field === column && sort.order === "asc" ? "desc" : "asc";
		return buildUrl({ sort: column, order: newOrder }, sort);
	};

	return (
		<Layout
			title={`${datastore.name} - ${appTitle}`}
			lang={lang}
			appTitle={appTitle}
		>
			<div class="min-h-screen">
				<Navbar
					session={session}
					lang={lang}
					logoUrl={logoUrl}
					appTitle={appTitle}
					breadcrumb={datastore.name}
				>
					{/* Settings button passed as child to Navbar */}
					<button
						type="button"
						onclick="document.getElementById('settings-modal').classList.remove('hidden')"
						class="text-sm text-surface-400 hover:text-surface-200 transition-colors flex items-center gap-1.5 cursor-pointer"
						title={t(langCode, "datastore.settings")}
					>
						<SettingsIcon />
						<span class="hidden sm:inline">
							{t(langCode, "datastore.settings")}
						</span>
					</button>
				</Navbar>

				{/* Main Content */}
				<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
						<div>
							<div class="flex items-center gap-2">
								<a
									href="/"
									class="text-surface-400 hover:text-surface-200 transition-colors cursor-pointer"
								>
									<svg
										class="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 19l-7-7 7-7"
										/>
									</svg>
								</a>
								<h1 class="text-2xl font-bold text-surface-100">
									{datastore.name}
								</h1>
							</div>
							{datastore.description && (
								<p class="text-surface-400 mt-1">{datastore.description}</p>
							)}
						</div>
						<button
							type="button"
							class="btn btn-primary flex flex-row items-center"
							onclick="document.getElementById('create-modal').classList.remove('hidden')"
						>
							<svg
								class="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							{t(langCode, "datastore.addRecord")}
						</button>
					</div>

					{/* Records Table */}
					<div class="card p-0 overflow-hidden">
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead>
									<tr class="border-b border-surface-700">
										{columns.map((col) => (
											<th class="table-header">
												<a
													href={getSortUrl(col.technical_name)}
													class="flex items-center hover:text-primary-400 transition-colors cursor-pointer"
												>
													{col.name}
													{sort.field === col.technical_name &&
														(sort.order === "asc" ? (
															<SortAscIcon />
														) : (
															<SortDescIcon />
														))}
												</a>
											</th>
										))}
										<th class="table-header w-20">
											{t(langCode, "common.actions")}
										</th>
									</tr>
								</thead>
								<tbody>
									{records.length === 0 ? (
										<tr>
											<td
												colspan={columns.length + 1}
												class="table-cell text-center text-surface-400 py-12"
											>
												{t(langCode, "datastore.noRecords")}
											</td>
										</tr>
									) : (
										records.map((record) => (
											<>
												<tr class="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
													{columns.map((col) => (
														<td class="table-cell text-surface-200">
															{formatValue(
																record.data[col.technical_name],
																col.type,
															)}
														</td>
													))}
													<td class="table-cell">
														<div class="flex items-center gap-2">
															<button
																type="button"
																class="p-1.5 text-surface-400 hover:text-primary-400 hover:bg-surface-700 rounded transition-colors cursor-pointer"
																onclick={`openEditModal('${record.id}', ${JSON.stringify(record.data).replace(/'/g, "\\'")})`}
																title={t(langCode, "common.edit")}
															>
																<svg
																	class="w-4 h-4"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		stroke-linecap="round"
																		stroke-linejoin="round"
																		stroke-width="2"
																		d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																	/>
																</svg>
															</button>
															<button
																type="button"
																class="p-1.5 text-surface-400 hover:text-red-400 hover:bg-surface-700 rounded transition-colors cursor-pointer"
																onclick={`deleteRecord('${record.id}')`}
																title={t(langCode, "common.delete")}
															>
																<svg
																	class="w-4 h-4"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		stroke-linecap="round"
																		stroke-linejoin="round"
																		stroke-width="2"
																		d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
																	/>
																</svg>
															</button>
														</div>
													</td>
												</tr>
												{/* Metadata row - responsive stacking */}
												<tr class="border-b border-surface-800">
													<td
														colspan={columns.length + 1}
														class="px-4 py-2 text-xs text-surface-500"
													>
														<div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
															<span>
																{t(langCode, "datastore.createdBy")}{" "}
																<span class="text-surface-400">
																	{record.created_by_email || "-"}
																</span>
															</span>
															<span>
																{t(langCode, "datastore.createdAt")}{" "}
																<span class="text-surface-400">
																	{formatDate(record.created_at, langCode)}
																</span>
															</span>
															{record.updated_by && (
																<>
																	<span class="hidden sm:inline text-surface-600">
																		·
																	</span>
																	<span>
																		{t(langCode, "datastore.updatedBy")}{" "}
																		<span class="text-surface-400">
																			{record.updated_by_email || "-"}
																		</span>
																	</span>
																	<span>
																		{t(langCode, "datastore.updatedAt")}{" "}
																		<span class="text-surface-400">
																			{formatDate(record.updated_at, langCode)}
																		</span>
																	</span>
																</>
															)}
														</div>
													</td>
												</tr>
											</>
										))
									)}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-surface-800">
								<span class="text-sm text-surface-400 text-center sm:text-left">
									{t(langCode, "common.showing")}{" "}
									{(pagination.page - 1) * pagination.limit + 1}{" "}
									{t(langCode, "common.to")}{" "}
									{Math.min(
										pagination.page * pagination.limit,
										pagination.total,
									)}{" "}
									{t(langCode, "common.of")} {pagination.total}
								</span>
								<div class="flex gap-2 justify-center sm:justify-end">
									{pagination.page > 1 && (
										<a
											href={buildUrl({ page: pagination.page - 1 }, sort)}
											class="btn btn-secondary text-sm"
										>
											{t(langCode, "common.previous")}
										</a>
									)}
									{pagination.page < pagination.totalPages && (
										<a
											href={buildUrl({ page: pagination.page + 1 }, sort)}
											class="btn btn-secondary text-sm"
										>
											{t(langCode, "common.next")}
										</a>
									)}
								</div>
							</div>
						)}
					</div>
				</main>

				{/* Create/Edit Modal */}
				<div
					id="create-modal"
					class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
				>
					<div class="card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
						<div class="flex items-center justify-between mb-4">
							<h2
								id="modal-title"
								class="text-lg font-semibold text-surface-100"
							>
								{t(langCode, "datastore.addRecord")}
							</h2>
							<button
								type="button"
								onclick="closeModal()"
								class="p-1 text-surface-400 hover:text-surface-200 cursor-pointer"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<form id="record-form" onsubmit="return handleFormSubmit(event)">
							<input type="hidden" id="record-id" value="" />
							<input type="hidden" id="form-method" value="POST" />
							<div
								id="form-error"
								class="hidden mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
							></div>
							<div class="space-y-4">
								{columns.map((col) => (
									<div>
										<label class="block text-sm font-medium text-surface-300 mb-1.5">
											{col.name}
											{col.required && <span class="text-red-400 ml-1">*</span>}
										</label>
										{renderInput(col, datastore.slug, langCode)}
										{col.description && (
											<p class="text-xs text-surface-500 mt-1">
												{col.description}
											</p>
										)}
									</div>
								))}
							</div>
							<div class="flex justify-end gap-3 mt-6">
								<button
									type="button"
									onclick="closeModal()"
									class="btn btn-secondary"
								>
									{t(langCode, "common.cancel")}
								</button>
								<button type="submit" id="submit-btn" class="btn btn-primary">
									<span id="submit-text">{t(langCode, "common.save")}</span>
									<span id="submit-loading" class="hidden">
										<svg
											class="animate-spin h-4 w-4 mr-2"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										{t(langCode, "common.saving")}
									</span>
								</button>
							</div>
						</form>
					</div>
				</div>

				{/* Media Preview Modal */}
				<div
					id="media-modal"
					class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
				>
					<div class="relative max-w-4xl max-h-[90vh] mx-4">
						<button
							type="button"
							onclick="closeMediaModal()"
							class="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
						>
							<svg
								class="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
						<div
							id="media-modal-title"
							class="absolute -top-10 left-0 text-white/70 text-sm truncate max-w-[calc(100%-3rem)]"
						></div>
						<div
							id="media-modal-content"
							class="bg-surface-900 rounded-lg overflow-hidden"
						></div>
					</div>
				</div>

				{/* Settings Modal */}
				<div
					id="settings-modal"
					class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
					onclick="if (event.target === event.currentTarget) document.getElementById('settings-modal').classList.add('hidden')"
				>
					<div class="bg-surface-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-surface-700">
						<div class="flex items-center justify-between p-6 border-b border-surface-700">
							<h2
								id="settings-modal-title"
								class="text-lg font-semibold text-surface-100"
							>
								{t(langCode, "datastore.cacheSettings")}
							</h2>
							<button
								type="button"
								onclick="document.getElementById('settings-modal').classList.add('hidden')"
								class="p-1 text-surface-400 hover:text-surface-200 cursor-pointer"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<form
							id="settings-form"
							onsubmit="return handleSettingsSubmit(event)"
							class="p-6"
						>
							<div
								id="settings-error"
								class="hidden mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
							></div>
							<div class="space-y-4">
								<div>
									<label
										for="cache-duration-input"
										class="block text-sm font-medium text-surface-300 mb-1.5"
									>
										{t(langCode, "datastore.cacheDurationLabel")}
									</label>
									<input
										type="number"
										id="cache-duration-input"
										name="cache_duration_seconds"
										min="0"
										max="31536000"
										step="1"
										value={datastore.cache_duration_seconds ?? ""}
										placeholder={t(
											langCode,
											"datastore.cacheDurationPlaceholder",
										)}
										class="input w-full"
									/>
									<p class="text-xs text-surface-500 mt-1.5">
										{t(langCode, "datastore.cacheDurationDescription")}
									</p>
								</div>
							</div>
							<div class="flex justify-end gap-3 mt-6">
								<button
									type="button"
									onclick="document.getElementById('settings-modal').classList.add('hidden')"
									class="btn btn-secondary"
								>
									{t(langCode, "common.cancel")}
								</button>
								<button
									type="submit"
									id="settings-submit-btn"
									class="btn btn-primary"
								>
									<span id="settings-submit-text">
										{t(langCode, "common.save")}
									</span>
									<span id="settings-submit-loading" class="hidden">
										<svg
											class="animate-spin h-4 w-4 mr-2"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										{t(langCode, "common.saving")}
									</span>
								</button>
							</div>
						</form>
					</div>
				</div>

				{/* Scripts for modal handling */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
          const DATASTORE_SLUG = '${datastore.slug}';
          const FILE_COLUMNS = ${JSON.stringify(columns.filter((c) => c.type === "file").map((c) => c.technical_name))};
          const EXISTING_FILE_REFS = {};
          
          const translations = {
            addRecord: '${t(langCode, "datastore.addRecord")}',
            editRecord: '${t(langCode, "datastore.editRecord")}',
            currentFile: '${t(langCode, "datastore.currentFile")}',
            selectNewFile: '${t(langCode, "datastore.selectNewFile")}',
            deleteConfirm: '${t(langCode, "datastore.deleteConfirm")}',
            uploading: '${t(langCode, "datastore.uploading") || "Uploading..."}',
          };
          
          // Media preview modal functions
          function openMediaModal(url, filename, contentType) {
            const modal = document.getElementById('media-modal');
            const content = document.getElementById('media-modal-content');
            const title = document.getElementById('media-modal-title');
            
            title.textContent = filename || 'Preview';
            
            if (contentType && contentType.startsWith('video/')) {
              content.innerHTML = '<video src="' + url + '" controls autoplay class="max-w-full max-h-[80vh]"></video>';
            } else {
              content.innerHTML = '<img src="' + url + '" alt="' + (filename || 'Preview') + '" class="max-w-full max-h-[80vh]" />';
            }
            
            modal.classList.remove('hidden');
          }
          
          function closeMediaModal() {
            const modal = document.getElementById('media-modal');
            const content = document.getElementById('media-modal-content');
            modal.classList.add('hidden');
            content.innerHTML = '';
          }
          
          // Close media modal on backdrop click
          document.getElementById('media-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeMediaModal();
          });
          
          function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
          }

          function closeModal() {
            document.getElementById('create-modal').classList.add('hidden');
            document.getElementById('record-form').reset();
            document.getElementById('record-id').value = '';
            document.getElementById('form-method').value = 'POST';
            document.getElementById('modal-title').textContent = translations.addRecord;
            document.getElementById('form-error').classList.add('hidden');
            
            // Clear file state
            Object.keys(EXISTING_FILE_REFS).forEach(k => delete EXISTING_FILE_REFS[k]);
            document.querySelectorAll('[id^="file-preview-"]').forEach(el => el.innerHTML = '');
            document.querySelectorAll('[id^="file-current-"]').forEach(el => el.innerHTML = '');
            document.querySelectorAll('[id^="file-progress-"]').forEach(el => el.classList.add('hidden'));
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

          function openEditModal(id, data) {
            document.getElementById('create-modal').classList.remove('hidden');
            document.getElementById('record-id').value = id;
            document.getElementById('form-method').value = 'PATCH';
            document.getElementById('modal-title').textContent = translations.editRecord;
            
            // Fill form with existing data
            Object.entries(data).forEach(([key, value]) => {
              const input = document.querySelector('[name="' + key + '"]');
              if (input) {
                if (input.type === 'checkbox') {
                  input.checked = value === true || value === 'true';
                } else if (input.type === 'file') {
                  // Store existing file reference for later
                  if (value && typeof value === 'object' && value.file_id) {
                    EXISTING_FILE_REFS[key] = value;
                    const currentFileDiv = document.getElementById('file-current-' + key);
                    if (currentFileDiv) {
                      currentFileDiv.innerHTML = translations.currentFile + ' <a href="' + (value.url || '#') + '" target="_blank" class="text-primary-400 hover:text-primary-300 underline">' + (value.filename || 'File') + '</a> (' + formatBytes(value.size || 0) + '). ' + translations.selectNewFile;
                    }
                  }
                } else {
                  input.value = value ?? '';
                }
              }
            });
          }

          async function uploadFile(fieldName, file) {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('file', file);
              
              const xhr = new XMLHttpRequest();
              const progressContainer = document.getElementById('file-progress-' + fieldName);
              const progressBar = document.getElementById('file-progress-bar-' + fieldName);
              const progressText = document.getElementById('file-progress-text-' + fieldName);
              
              // Initialize progress state
              if (progressContainer) progressContainer.classList.remove('hidden');
              if (progressBar) progressBar.style.width = '0%';
              if (progressText) progressText.textContent = '0%';
              
              let lastUpdate = 0;
              xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                  const percent = Math.round((e.loaded / e.total) * 100);
                  // Throttle updates to every 50ms for smoother animation
                  const now = Date.now();
                  if (now - lastUpdate > 50 || percent === 100) {
                    lastUpdate = now;
                    if (progressBar) progressBar.style.width = percent + '%';
                    if (progressText) progressText.textContent = percent + '%';
                  }
                }
              });
              
              // Handle upload complete but waiting for server response
              xhr.upload.addEventListener('load', () => {
                if (progressBar) progressBar.style.width = '100%';
                if (progressText) progressText.textContent = translations.uploading;
              });
              
              xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                  } catch (e) {
                    reject(new Error('Invalid response from server'));
                  }
                } else {
                  try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.error || 'Upload failed'));
                  } catch (e) {
                    reject(new Error('Upload failed: ' + xhr.status));
                  }
                }
              });
              
              xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
              xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
              
              xhr.open('POST', '/api/datastores/' + DATASTORE_SLUG + '/files');
              xhr.send(formData);
            });
          }

          async function handleFormSubmit(event) {
            event.preventDefault();
            
            const form = event.target;
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const submitLoading = document.getElementById('submit-loading');
            const errorDiv = document.getElementById('form-error');
            
            // Disable form
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            submitLoading.classList.remove('hidden');
            errorDiv.classList.add('hidden');
            
            try {
              const recordId = document.getElementById('record-id').value;
              const method = document.getElementById('form-method').value;
              const isEdit = method === 'PATCH';
              
              // Collect form data
              const data = {};
              const formData = new FormData(form);
              
              // Get all non-file inputs
              for (const [key, value] of formData.entries()) {
                if (!FILE_COLUMNS.includes(key)) {
                  const input = form.querySelector('[name="' + key + '"]');
                  if (input && input.type === 'checkbox') {
                    data[key] = input.checked;
                  } else if (value === '') {
                    data[key] = null;
                  } else if (input && input.type === 'number') {
                    data[key] = value === '' ? null : parseFloat(value);
                  } else {
                    data[key] = value;
                  }
                }
              }
              
              // Handle checkbox fields that might not be in formData when unchecked
              form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (!FILE_COLUMNS.includes(cb.name)) {
                  data[cb.name] = cb.checked;
                }
              });
              
              // Upload files and get references
              for (const fieldName of FILE_COLUMNS) {
                const input = document.getElementById('file-' + fieldName);
                const file = input?.files?.[0];
                
                if (file) {
                  // Upload new file
                  const fileRef = await uploadFile(fieldName, file);
                  data[fieldName] = {
                    file_id: fileRef.file_id,
                    filename: fileRef.filename,
                    content_type: fileRef.content_type,
                    size: fileRef.size
                  };
                } else if (isEdit && EXISTING_FILE_REFS[fieldName]) {
                  // Keep existing file reference
                  data[fieldName] = EXISTING_FILE_REFS[fieldName];
                } else if (input?.dataset.required === 'true' && !isEdit) {
                  throw new Error('File is required for ' + fieldName);
                }
              }
              
              // Submit record
              const url = isEdit 
                ? '/api/datastores/' + DATASTORE_SLUG + '/records/' + recordId
                : '/api/datastores/' + DATASTORE_SLUG + '/records';
              
              const response = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data })
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.details?.map(d => d.message).join(', ') || 'Failed to save record');
              }
              
              // Success - reset form state before reload to ensure clean state
              closeModal();
              window.location.reload();
              
            } catch (error) {
              errorDiv.textContent = error.message;
              errorDiv.classList.remove('hidden');
              submitBtn.disabled = false;
              submitText.classList.remove('hidden');
              submitLoading.classList.add('hidden');
            }
          }

          async function deleteRecord(recordId) {
            if (!confirm(translations.deleteConfirm)) return;
            
            try {
              const response = await fetch('/api/datastores/' + DATASTORE_SLUG + '/records/' + recordId, {
                method: 'DELETE'
              });
              
              if (!response.ok && response.status !== 204) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete record');
              }
              
              window.location.reload();
            } catch (error) {
              alert(error.message);
            }
          }

          // Close modals on escape key
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              closeModal();
              closeMediaModal();
            }
          });

          // Close modal on backdrop click
          document.getElementById('create-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
          });

          // Settings form handler
          async function handleSettingsSubmit(event) {
            event.preventDefault();
            
            const form = event.target;
            const submitBtn = document.getElementById('settings-submit-btn');
            const submitText = document.getElementById('settings-submit-text');
            const submitLoading = document.getElementById('settings-submit-loading');
            const errorDiv = document.getElementById('settings-error');
            
            // Disable form
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            submitLoading.classList.remove('hidden');
            errorDiv.classList.add('hidden');
            
            try {
              const formData = new FormData(form);
              const cacheDurationValue = formData.get('cache_duration_seconds');
              const cacheDurationSeconds = cacheDurationValue && cacheDurationValue !== '' 
                ? parseInt(cacheDurationValue, 10) 
                : null;
              
              // Validate cache duration
              if (cacheDurationSeconds !== null) {
                if (isNaN(cacheDurationSeconds) || cacheDurationSeconds < 0 || cacheDurationSeconds > 31536000) {
                  throw new Error('${t(langCode, "datastore.cacheDurationInvalid")}');
                }
              }
              
              const response = await fetch(\`/api/datastores/\${DATASTORE_SLUG}\`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  cache_duration_seconds: cacheDurationSeconds,
                }),
              });
              
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update cache settings');
              }
              
              // Close modal and reload page to show updated settings
              document.getElementById('settings-modal').classList.add('hidden');
              window.location.reload();
            } catch (error) {
              errorDiv.textContent = error.message || 'Failed to update cache settings';
              errorDiv.classList.remove('hidden');
            } finally {
              submitBtn.disabled = false;
              submitText.classList.remove('hidden');
              submitLoading.classList.add('hidden');
            }
          }

          // Close settings modal on escape key
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              const settingsModal = document.getElementById('settings-modal');
              if (settingsModal && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
              }
            }
          });
        `,
					}}
				/>
			</div>
		</Layout>
	);
};

function formatDate(date: Date | string, locale: string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "-";
	return d.toLocaleString(locale);
}

function formatValue(value: unknown, type: string): string | any {
	if (value === null || value === undefined) return "-";
	if (type === "boolean") return value ? "✓" : "✗";
	if (type === "date") {
		const date = new Date(value as string);
		return Number.isNaN(date.getTime())
			? String(value)
			: date.toLocaleDateString();
	}
	if (
		type === "file" &&
		typeof value === "object" &&
		value !== null &&
		"file_id" in value
	) {
		const fileRef = value as {
			filename?: string;
			url?: string;
			content_type?: string;
		};
		const url = fileRef.url || "#";
		const filename = fileRef.filename || "File";
		const contentType = fileRef.content_type || "";

		// Show thumbnail for images
		if (isImageType(contentType)) {
			return (
				<button
					type="button"
					onclick={`openMediaModal('${url}', '${filename.replace(/'/g, "\\'")}', '${contentType}')`}
					class="block hover:opacity-80 transition-opacity cursor-pointer"
				>
					<img
						src={url}
						alt={filename}
						class="w-12 h-12 object-cover rounded border border-surface-700"
					/>
				</button>
			);
		}

		// Show thumbnail for videos with play overlay
		if (isVideoType(contentType)) {
			return (
				<button
					type="button"
					onclick={`openMediaModal('${url}', '${filename.replace(/'/g, "\\'")}', '${contentType}')`}
					class="relative block hover:opacity-80 transition-opacity cursor-pointer"
				>
					<video
						src={url}
						class="w-12 h-12 object-cover rounded border border-surface-700"
						preload="metadata"
					/>
					<div class="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
						<svg
							class="w-5 h-5 text-white"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
						</svg>
					</div>
				</button>
			);
		}

		// Default file link
		return (
			<a
				href={url}
				class="text-primary-400 hover:text-primary-300 underline cursor-pointer"
				target="_blank"
				rel="noopener noreferrer"
			>
				{filename}
			</a>
		);
	}
	return String(value);
}

function renderInput(
	col: DataStore["column_definitions"][0],
	_slug: string,
	lang: "en" | "de",
) {
	const baseClass = "input";
	const _required = col.required ? "required" : "";

	switch (col.type) {
		case "boolean":
			return (
				<input
					type="checkbox"
					name={col.technical_name}
					class="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500"
				/>
			);
		case "number":
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
		case "date":
			return (
				<input
					type="date"
					name={col.technical_name}
					class={baseClass}
					required={col.required}
				/>
			);
		case "select":
			return (
				<select
					name={col.technical_name}
					class={baseClass}
					required={col.required}
				>
					<option value="">{t(lang, "common.select")}</option>
					{col.options?.map((opt) => (
						<option value={opt}>{opt}</option>
					))}
				</select>
			);
		case "file":
			return (
				<div>
					<input
						type="file"
						name={col.technical_name}
						id={`file-${col.technical_name}`}
						class={baseClass}
						accept={getAcceptAttribute(
							col.validation?.acceptPreset,
							col.validation?.allowedContentTypes,
						)}
						data-max-size={col.validation?.maxFileSize}
						data-required={col.required ? "true" : "false"}
						onchange={`handleFileInput('${col.technical_name}')`}
					/>
					<div
						id={`file-preview-${col.technical_name}`}
						class="mt-2 text-sm text-surface-400"
					></div>
					<div
						id={`file-current-${col.technical_name}`}
						class="mt-2 text-sm text-surface-400"
					></div>
					<div id={`file-progress-${col.technical_name}`} class="hidden mt-2">
						<div class="flex items-center gap-2">
							<div class="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
								<div
									id={`file-progress-bar-${col.technical_name}`}
									class="h-full bg-primary-500 transition-[width] duration-75"
									style="width: 0%"
								></div>
							</div>
							<span
								id={`file-progress-text-${col.technical_name}`}
								class="text-xs text-surface-400 w-12 text-right"
							>
								0%
							</span>
						</div>
					</div>
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
