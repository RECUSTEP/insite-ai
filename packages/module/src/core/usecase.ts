import type { Database } from "./db";

export abstract class UseCase<T extends "d1" | "libsql"> {
  protected readonly db: Database<T>;
  constructor(db: Database<T>) {
    this.db = db;
  }
}
