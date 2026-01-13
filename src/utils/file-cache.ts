import { LRUCache } from "lru-cache";
import { downloadFile } from "./s3";

interface CachedFile {
	body: Buffer;
	contentType: string;
	cachedAt: number;
}

const maxMemoryBytes = parseInt(
	process.env.FILE_CACHE_MAX_MEMORY_BYTES || "104857600",
	10,
); // Default 100MB
const ttlMs = parseInt(process.env.FILE_CACHE_TTL_MS || "86400000", 10); // Default 24 hours

const cache = new LRUCache<string, CachedFile>({
	maxSize: maxMemoryBytes,
	ttl: ttlMs,
	updateAgeOnGet: true,
	sizeCalculation: (value) => value.body.length,
});

export async function getCachedFile(
	objectKey: string,
): Promise<{ body: Buffer; contentType: string } | null> {
	const cached = cache.get(objectKey);
	if (cached) {
		return { body: cached.body, contentType: cached.contentType };
	}

	// Cache miss - fetch from S3
	try {
		const { body, contentType } = await downloadFile(objectKey);
		cache.set(objectKey, {
			body,
			contentType,
			cachedAt: Date.now(),
		});
		return { body, contentType };
	} catch (_error) {
		return null;
	}
}

export function clearCache(): void {
	cache.clear();
}

export function getCacheStats() {
	return {
		size: cache.size,
		calculatedSize: cache.calculatedSize,
		maxSize: maxMemoryBytes,
		ttl: ttlMs,
	};
}
