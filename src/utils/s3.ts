import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || "us-east-1";
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const pathPrefix = process.env.S3_PATH_PREFIX || "";

if (!bucket || !accessKeyId || !secretAccessKey) {
	console.warn("S3 configuration incomplete. File uploads will be disabled.");
}

export const s3Client =
	bucket && accessKeyId && secretAccessKey
		? new S3Client({
				region,
				endpoint: endpoint || undefined,
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
				forcePathStyle: endpoint ? true : undefined, // Required for MinIO, Hetzner, and other S3-compatible services
			})
		: null;

export const S3_BUCKET = bucket || "";

/**
 * Prepends the configured path prefix to an object key.
 * Handles trailing/leading slashes properly.
 */
function prefixObjectKey(objectKey: string): string {
	if (!pathPrefix) {
		return objectKey;
	}

	// Normalize prefix: remove leading slash, ensure trailing slash
	const normalizedPrefix = `${pathPrefix.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
	// Normalize key: remove leading slash
	const normalizedKey = objectKey.replace(/^\/+/, "");

	return normalizedPrefix + normalizedKey;
}

export async function uploadFile(
	objectKey: string,
	body: Buffer,
	contentType: string,
): Promise<void> {
	if (!s3Client || !S3_BUCKET) {
		throw new Error("S3 not configured");
	}

	const prefixedKey = prefixObjectKey(objectKey);

	await s3Client.send(
		new PutObjectCommand({
			Bucket: S3_BUCKET,
			Key: prefixedKey,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function downloadFile(
	objectKey: string,
): Promise<{ body: Buffer; contentType: string }> {
	if (!s3Client || !S3_BUCKET) {
		throw new Error("S3 not configured");
	}

	const prefixedKey = prefixObjectKey(objectKey);

	const response = await s3Client.send(
		new GetObjectCommand({
			Bucket: S3_BUCKET,
			Key: prefixedKey,
		}),
	);

	if (!response.Body) {
		throw new Error("File not found in S3");
	}

	const body = await response.Body.transformToByteArray();
	const contentType = response.ContentType || "application/octet-stream";

	return { body: Buffer.from(body), contentType };
}

export async function deleteFile(objectKey: string): Promise<void> {
	if (!s3Client || !S3_BUCKET) {
		throw new Error("S3 not configured");
	}

	const prefixedKey = prefixObjectKey(objectKey);

	await s3Client.send(
		new DeleteObjectCommand({
			Bucket: S3_BUCKET,
			Key: prefixedKey,
		}),
	);
}
