import { createHash, randomBytes } from "node:crypto";

export function generateApiKey(): { key: string; hash: string } {
	const key = `dsk_${randomBytes(32).toString("base64url")}`;
	const hash = hashApiKey(key);
	return { key, hash };
}

export function hashApiKey(key: string): string {
	return createHash("sha256").update(key).digest("hex");
}
