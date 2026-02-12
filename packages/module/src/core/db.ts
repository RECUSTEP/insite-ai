import type * as schema from "@repo/db/schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

export type Database<T extends "d1" | "libsql"> = T extends "d1"
  ? DrizzleD1Database<typeof schema>
  : LibSQLDatabase<typeof schema>;
