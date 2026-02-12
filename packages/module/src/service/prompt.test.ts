import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../../test/utils";
import type { PromptInsert } from "../schema";
import { PromptUseCase } from "./prompt";

describe("PromptUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: PromptUseCase<"libsql">;

  beforeEach(async () => {
    [client, db] = await initDb();
    usecase = new PromptUseCase(db);
  });

  afterEach(() => {
    client.close();
  });

  const prompts = [
    {
      aiType: "market",
      user: "user prompt",
      system: "system prompt",
    },
    {
      aiType: "competitor",
      user: "user prompt",
      system: "system prompt",
    },
  ] as const satisfies PromptInsert[];

  it("プロンプトが保存できる", async () => {
    const result = await usecase.savePrompt(prompts);
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(prompts);
  });

  it("プロンプトが取得できる", async () => {
    await usecase.savePrompt(prompts);
    const result = await usecase.getPrompt();
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(prompts);
  });

  it("aiTypeでプロンプトが取得できる", async () => {
    await usecase.savePrompt(prompts);
    const result = await usecase.getPromptByAiType("market");
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(prompts[0]);
  });

  it("プロンプトが更新できる", async () => {
    await usecase.savePrompt(prompts);
    const updated = prompts.map((prompt) => ({
      ...prompt,
      user: "updated user prompt",
      system: "updated system prompt",
    }));
    await usecase.savePrompt(updated);
    const result = await usecase.getPrompt();
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(updated);
  });
});
