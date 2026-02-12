import type { Context } from "hono";
import { encodeBase64Url } from "hono/utils/encode";
import type { Env } from "../env";

const mimeExtMap = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export async function upload<E extends Env>(c: Context<E>, projectId: string, file: File) {
  const ext = mimeExtMap.get(file.type);
  if (!ext) {
    throw new Error("Invalid file type");
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const hashArray = new Uint8Array(hashBuffer);
  const hash = encodeBase64Url(hashArray);
  const path = `${projectId}/${hash}.${ext}`;
  await c.env.BUCKET.put(path, file, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  return path;
}

export async function get<E extends Env>(c: Context<E>, path: string) {
  return await c.env.BUCKET.get(path);
}
