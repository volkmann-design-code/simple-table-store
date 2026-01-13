export interface Organization {
	id: string;
	name: string;
	created_at: Date;
	updated_at: Date;
}

export interface User {
	id: string;
	org_id: string;
	email: string;
	password_hash: string;
	created_at: Date;
	updated_at: Date;
}

export interface UserPublic {
	id: string;
	org_id: string;
	email: string;
	created_at: Date;
	updated_at: Date;
}

/** Preset categories for file type restrictions */
export type FileAcceptPreset = "images" | "videos" | "audio" | "documents";

export interface ColumnDefinition {
	name: string;
	technical_name: string;
	description?: string;
	type: "text" | "number" | "boolean" | "date" | "select" | "file";
	required: boolean;
	options?: string[];
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
		maxFileSize?: number; // For file type: max size in bytes
		allowedContentTypes?: string[]; // For file type: allowed MIME types (takes precedence over acceptPreset)
		acceptPreset?: FileAcceptPreset; // For file type: preset category (images, videos, audio, documents)
	};
}

export interface DataStore {
	id: string;
	org_id: string;
	name: string;
	slug: string;
	description: string | null;
	column_definitions: ColumnDefinition[];
	created_at: Date;
	updated_at: Date;
}

export interface DataRecord {
	id: string;
	datastore_id: string;
	data: { [key: string]: unknown };
	created_at: Date;
	updated_at: Date;
}

export interface ApiKey {
	id: string;
	datastore_id: string;
	key_hash: string;
	name: string;
	created_at: Date;
	expires_at: Date | null;
}

export interface SessionPayload {
	userId: string;
	orgId: string;
	email: string;
	exp: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface File {
	id: string;
	datastore_id: string;
	object_key: string;
	filename: string;
	content_type: string;
	size_bytes: number;
	created_at: Date;
	created_by_user_id: string | null;
}

export interface FileReference {
	file_id: string;
	filename: string;
	content_type: string;
	size: number;
	url: string;
}
