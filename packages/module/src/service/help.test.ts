import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../../test/utils";
import type { HelpInsert } from "../schema";
import { HelpUseCase } from "./help";

describe("HelpUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: HelpUseCase<"libsql">;

  beforeEach(async () => {
    [client, db] = await initDb();
    usecase = new HelpUseCase(db);
  });

  afterEach(() => {
    client.close();
  });

  const helps: HelpInsert[] = [
    {
      aiType: "market",
      text: "market help",
    },
    {
      aiType: "competitor",
      text: "competitor help",
    },
  ];

  it("ヘルプが保存できる", async () => {
    const result = await usecase.saveHelp(helps);
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(helps);
  });

  it("ヘルプが取得できる", async () => {
    await usecase.saveHelp(helps);
    const result = await usecase.getHelp();
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(helps);
  });

  it("ヘルプが更新できる", async () => {
    await usecase.saveHelp(helps);
    const updated = helps.map((help) => ({
      ...help,
      text: "updated",
    }));
    await usecase.saveHelp(updated);
    const result = await usecase.getHelp();
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(updated);
  });
});
