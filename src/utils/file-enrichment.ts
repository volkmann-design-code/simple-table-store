import type { DataRecord, DataStore, FileReference } from "../types";

/**
 * Enriches record data with file URLs for file-type columns.
 * For API key access, prepopulates URLs with the API key as a query parameter.
 */
export function enrichRecordWithFileUrls(
	record: DataRecord,
	datastore: DataStore,
	apiKey?: string | null,
): DataRecord {
	const enrichedData = { ...record.data };

	for (const column of datastore.column_definitions) {
		if (column.type === "file") {
			const value = enrichedData[column.technical_name];
			if (
				value &&
				typeof value === "object" &&
				value !== null &&
				"file_id" in value
			) {
				const fileRef = value as {
					file_id: string;
					filename?: string;
					content_type?: string;
					size?: number;
				};
				let url = `/api/files/${fileRef.file_id}`;

				// For API key access, prepopulate URL with API key
				if (apiKey) {
					url = `${url}?api_key=${encodeURIComponent(apiKey)}`;
				}

				const enrichedFileRef: FileReference = {
					file_id: fileRef.file_id,
					filename: fileRef.filename || "file",
					content_type: fileRef.content_type || "application/octet-stream",
					size: fileRef.size || 0,
					url,
				};

				enrichedData[column.technical_name] = enrichedFileRef;
			}
		}
	}

	return {
		...record,
		data: enrichedData,
	};
}
