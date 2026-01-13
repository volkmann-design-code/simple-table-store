import type { FileAcceptPreset } from "../types";

/**
 * Maps preset names to MIME patterns for the HTML accept attribute
 */
export const FILE_PRESET_ACCEPT: Record<FileAcceptPreset, string> = {
	images: "image/*",
	videos: "video/*",
	audio: "audio/*",
	documents:
		"application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/*",
};

/**
 * Maps preset names to MIME type patterns for validation
 * These patterns are used for server-side validation
 */
export const FILE_PRESET_MIME_PATTERNS: Record<FileAcceptPreset, string[]> = {
	images: ["image/"],
	videos: ["video/"],
	audio: ["audio/"],
	documents: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument",
		"application/vnd.ms-",
		"text/",
	],
};

/**
 * Gets the accept attribute value for a file input based on preset or explicit types
 * @param preset - The preset category (images, videos, audio, documents)
 * @param allowedContentTypes - Explicit content types (takes precedence if provided)
 * @returns The accept attribute value or undefined if neither is specified
 */
export function getAcceptAttribute(
	preset?: FileAcceptPreset,
	allowedContentTypes?: string[],
): string | undefined {
	// Explicit types take precedence
	if (allowedContentTypes && allowedContentTypes.length > 0) {
		return allowedContentTypes.join(",");
	}
	// Fall back to preset
	if (preset && preset in FILE_PRESET_ACCEPT) {
		return FILE_PRESET_ACCEPT[preset];
	}
	return undefined;
}

/**
 * Validates if a content type matches a preset category
 * @param contentType - The MIME type to validate
 * @param preset - The preset category to check against
 * @returns true if the content type matches the preset
 */
export function matchesPreset(
	contentType: string,
	preset: FileAcceptPreset,
): boolean {
	const patterns = FILE_PRESET_MIME_PATTERNS[preset];
	if (!patterns) return false;

	return patterns.some((pattern) =>
		contentType.toLowerCase().startsWith(pattern.toLowerCase()),
	);
}
