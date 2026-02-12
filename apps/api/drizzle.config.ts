import crypto from "node:crypto";
import type { Config } from "drizzle-kit";

function durableObjectNamespaceIdFromName(uniqueKey: string, name: string) {
  const key = crypto.createHash("sha256").update(uniqueKey).digest();
  const nameHmac = crypto.createHmac("sha256", key).update(name).digest().subarray(0, 16);
  const hmac = crypto.createHmac("sha256", key).update(nameHmac).digest().subarray(0, 16);
  return Buffer.concat([nameHmac, hmac]).toString("hex");
}

const UNIQUE_KEY = "miniflare-D1DatabaseObject";
const PERSIST = "./.wrangler/state/v3/d1";
const DATABASE_ID = "b0beccc0-7fe2-4285-8a71-8b865cfcd7a9";

export default {
  dialect: "sqlite",
  schema: "./node_modules/@repo/db/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: `${PERSIST}/${UNIQUE_KEY}/${durableObjectNamespaceIdFromName(
      UNIQUE_KEY,
      DATABASE_ID,
    )}.sqlite`,
  },
} satisfies Config;
