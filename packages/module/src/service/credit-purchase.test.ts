import { createClient } from "@libsql/client";
import * as schemas from "@repo/db/schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreditPurchaseUseCaseError } from "../error";
import { CreditPurchaseUseCase } from "./credit-purchase";

describe("CreditPurchaseUseCase", () => {
  let client: ReturnType<typeof createClient>;
  let db: LibSQLDatabase<typeof schemas>;
  let useCase: CreditPurchaseUseCase<"libsql">;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T03:00:00.000Z"));
    client = createClient({ url: ":memory:" });
    db = drizzle(client, { schema: schemas });
    await client.executeMultiple(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE auth (
        id text PRIMARY KEY NOT NULL,
        password text NOT NULL,
        company_name text
      );
      CREATE TABLE project (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        auth_id text NOT NULL,
        manager_name text NOT NULL,
        owner_name text NOT NULL,
        project_id text UNIQUE NOT NULL,
        project_pass text NOT NULL,
        api_usage_limit integer NOT NULL,
        seo_addon_enabled integer DEFAULT 0 NOT NULL,
        meta_insight_enabled integer DEFAULT 0 NOT NULL,
        FOREIGN KEY (auth_id) REFERENCES auth(id)
      );
      CREATE TABLE credit_purchase_request (
        id text PRIMARY KEY NOT NULL,
        project_id text NOT NULL,
        payment_method text NOT NULL,
        transfer_name text,
        note text,
        credits integer NOT NULL,
        amount_yen integer NOT NULL,
        status text NOT NULL,
        created_at integer NOT NULL,
        updated_at integer NOT NULL,
        reviewed_at integer,
        approved_at integer,
        FOREIGN KEY (project_id) REFERENCES project(project_id) ON DELETE cascade
      );
    `);
    useCase = new CreditPurchaseUseCase(db);
    await db.insert(schemas.auth).values({ id: "auth", password: "password" });
    await db.insert(schemas.projects).values({
      name: "テスト店舗",
      authId: "auth",
      managerName: "担当者",
      ownerName: "オーナー",
      projectId: "project",
      projectPass: "password",
      apiUsageLimit: 100,
    });
  });

  afterEach(() => {
    client.close();
    vi.useRealTimers();
  });

  it("振込申請を作成し、承認後に当月の100クレジットへ反映する", async () => {
    const created = await useCase.createBankTransferRequest({
      projectId: "project",
      transferName: "カ）テスト",
      note: "7月分",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(created.val).toMatchObject({
      paymentMethod: "bank_transfer",
      credits: 100,
      amountYen: 2200,
      status: "pending",
    });

    const reviewed = await useCase.review({ id: created.val.id, status: "approved" });
    expect(reviewed.ok).toBe(true);
    const credits = await useCase.getApprovedCreditsForCurrentMonth("project");
    expect(credits.ok && credits.val).toBe(100);
  });

  it("確認待ちの申請は重複して作成できない", async () => {
    await useCase.createBankTransferRequest({
      projectId: "project",
      transferName: "テスト",
    });
    const duplicate = await useCase.createBankTransferRequest({
      projectId: "project",
      transferName: "テスト",
    });
    expect(duplicate.ok).toBe(false);
    expect(duplicate.val).toBe(CreditPurchaseUseCaseError.PendingRequestAlreadyExists);
  });

  it("却下した申請はクレジットに加算せず、再審査できない", async () => {
    const created = await useCase.createBankTransferRequest({
      projectId: "project",
      transferName: "テスト",
    });
    if (!created.ok) {
      throw new Error("request creation failed");
    }

    const rejected = await useCase.review({ id: created.val.id, status: "rejected" });
    expect(rejected.ok).toBe(true);
    const secondReview = await useCase.review({ id: created.val.id, status: "approved" });
    expect(secondReview.ok).toBe(false);
    expect(secondReview.val).toBe(CreditPurchaseUseCaseError.RequestAlreadyReviewed);

    const credits = await useCase.getApprovedCreditsForCurrentMonth("project");
    expect(credits.ok && credits.val).toBe(0);
  });

  it("前月に承認した追加クレジットは当月上限へ加算しない", async () => {
    vi.setSystemTime(new Date("2026-06-30T03:00:00.000Z"));
    const created = await useCase.createBankTransferRequest({
      projectId: "project",
      transferName: "テスト",
    });
    if (!created.ok) {
      throw new Error("request creation failed");
    }
    await useCase.review({ id: created.val.id, status: "approved" });

    vi.setSystemTime(new Date("2026-07-01T03:00:00.000Z"));
    const credits = await useCase.getApprovedCreditsForCurrentMonth("project");
    expect(credits.ok && credits.val).toBe(0);
  });
});
