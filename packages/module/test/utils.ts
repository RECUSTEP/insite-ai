import { createClient } from "@libsql/client";
import * as schema from "@repo/db/schema";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

export async function initDb() {
  const client = createClient({
    url: ":memory:",
  });
  const db = drizzle(client, { schema });
  await migrate(db, {
    migrationsFolder: "../../apps/api/migrations",
  });
  return [client, db] as const;
}
