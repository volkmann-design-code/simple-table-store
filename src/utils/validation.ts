import { t } from "../i18n";
import type { ColumnDefinition } from "../types";
import { FILE_PRESET_ACCEPT, matchesPreset } from "./file-presets";

export interface ValidationError {
	field: string;
	message: string;
}

export function validateRecordData(
	data: Record<string, unknown>,
	columns: ColumnDefinition[],
	lang: "en" | "de" = "en",
): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const column of columns) {
		const value = data[column.technical_name];

		// Required check
		if (
			column.required &&
			(value === undefined || value === null || value === "")
		) {
			errors.push({
				field: column.technical_name,
				message: t(lang, "errors.fieldRequired", { name: column.name }),
			});
			continue;
		}

		// Skip validation if value is empty and not required
		if (value === undefined || value === null || value === "") {
			continue;
		}

		// Type validation
		switch (column.type) {
			case "number": {
				const num = Number(value);
				if (Number.isNaN(num)) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeNumber", { name: column.name }),
					});
				} else if (
					column.validation?.min !== undefined &&
					num < column.validation.min
				) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeAtLeast", {
							name: column.name,
							min: String(column.validation.min),
						}),
					});
				} else if (
					column.validation?.max !== undefined &&
					num > column.validation.max
				) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeAtMost", {
							name: column.name,
							max: String(column.validation.max),
						}),
					});
				}
				break;
			}

			case "boolean": {
				if (
					typeof value !== "boolean" &&
					value !== "true" &&
					value !== "false"
				) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeBoolean", {
							name: column.name,
						}),
					});
				}
				break;
			}

			case "date": {
				const date = new Date(value as string);
				if (Number.isNaN(date.getTime())) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeValidDate", {
							name: column.name,
						}),
					});
				}
				break;
			}

			case "select": {
				if (column.options && !column.options.includes(value as string)) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeOneOf", {
							name: column.name,
							options: column.options.join(", "),
						}),
					});
				}
				break;
			}

			case "text": {
				if (typeof value !== "string") {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeString", { name: column.name }),
					});
				} else if (column.validation?.pattern) {
					const regex = new RegExp(column.validation.pattern);
					if (!regex.test(value)) {
						errors.push({
							field: column.technical_name,
							message: t(lang, "errors.fieldInvalidFormat", {
								name: column.name,
							}),
						});
					}
				}
				break;
			}

			case "file": {
				// File values should be file reference objects
				if (
					typeof value !== "object" ||
					value === null ||
					Array.isArray(value)
				) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustBeFileReference", {
							name: column.name,
						}),
					});
					break;
				}

				const fileRef = value as {
					file_id?: string;
					filename?: string;
					content_type?: string;
					size?: number;
				};

				if (!fileRef.file_id || typeof fileRef.file_id !== "string") {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fieldMustHaveValidFileId", {
							name: column.name,
						}),
					});
				}

				// Validate file size if specified
				if (
					column.validation?.maxFileSize &&
					fileRef.size &&
					fileRef.size > column.validation.maxFileSize
				) {
					errors.push({
						field: column.technical_name,
						message: t(lang, "errors.fileSizeExceeded", {
							name: column.name,
							maxSize: String(column.validation.maxFileSize),
						}),
					});
				}

				// Validate content type - explicit types take precedence over presets
				if (fileRef.content_type) {
					if (column.validation?.allowedContentTypes) {
						// Explicit content types specified
						if (
							!column.validation.allowedContentTypes.includes(
								fileRef.content_type,
							)
						) {
							errors.push({
								field: column.technical_name,
								message: t(lang, "errors.invalidContentType", {
									name: column.name,
									allowed: column.validation.allowedContentTypes.join(", "),
								}),
							});
						}
					} else if (column.validation?.acceptPreset) {
						// Validate against preset category
						if (
							!matchesPreset(
								fileRef.content_type,
								column.validation.acceptPreset,
							)
						) {
							errors.push({
								field: column.technical_name,
								message: t(lang, "errors.invalidContentType", {
									name: column.name,
									allowed: FILE_PRESET_ACCEPT[column.validation.acceptPreset],
								}),
							});
						}
					}
				}
				break;
			}
		}
	}

	return errors;
}
