import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../../test/utils";
import type { ApplicationSettingInsert } from "../schema";
import { ApplicationSettingUseCase } from "./application-setting";

describe("ApplicationSettingUseCase", () => {
  let client: Awaited<ReturnType<typeof initDb>>[0];
  let db: Awaited<ReturnType<typeof initDb>>[1];
  let usecase: ApplicationSettingUseCase<"libsql">;

  beforeEach(async () => {
    [client, db] = await initDb();
    usecase = new ApplicationSettingUseCase(db);
  });

  afterEach(() => {
    client.close();
  });

  const applicationSettings = [
    {
      key: "key1",
      value: "value1",
    },
    {
      key: "key2",
      value: "value2",
    },
  ] as const satisfies ApplicationSettingInsert[];

  it("アプリケーション設定が保存できる", async () => {
    const result = await usecase.saveApplicationSetting(applicationSettings);
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(applicationSettings);
  });

  it("アプリケーション設定が取得できる", async () => {
    await usecase.saveApplicationSetting(applicationSettings);
    const result = await usecase.getApplicationSetting();
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(applicationSettings);
  });

  it("アプリケーション設定が更新できる", async () => {
    await usecase.saveApplicationSetting(applicationSettings);
    const updated = applicationSettings.map((applicationSetting) => ({
      ...applicationSetting,
      value: "updated value",
    }));
    await usecase.saveApplicationSetting(updated);
    const result = await usecase.getApplicationSetting();
    expect(result.ok).toBe(true);
    expect(result.val).toMatchObject(updated);
  });
});
