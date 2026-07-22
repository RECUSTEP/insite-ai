import { zValidator } from "@hono/zod-validator";
import { CreditPurchaseUseCaseError } from "@repo/module/error";
import { CREDIT_PACKAGE_AMOUNT_YEN, CREDIT_PACKAGE_CREDITS } from "@repo/module/service";
import { z } from "zod";
import { projectGuard } from "./_factory";

const createRequestSchema = z.object({
  transferName: z.string().trim().min(1).max(100),
  note: z.string().trim().max(500).optional(),
});

const getHandler = projectGuard.createHandlers(async (c) => {
  const { projectId } = c.var.session;
  if (!projectId) {
    return c.json({ error: "プロジェクトが選択されていません。" }, 404);
  }

  const [requests, additionalCredits] = await Promise.all([
    c.var.creditPurchaseUseCase.getByProjectId(projectId),
    c.var.creditPurchaseUseCase.getApprovedCreditsForCurrentMonth(projectId),
  ]);
  if (!requests.ok || !additionalCredits.ok) {
    return c.json({ error: "購入申請の取得に失敗しました。" }, 500);
  }

  return c.json({
    package: {
      credits: CREDIT_PACKAGE_CREDITS,
      amountYen: CREDIT_PACKAGE_AMOUNT_YEN,
    },
    paymentMethods: {
      card: {
        available: false,
        message: "Stripeアカウント連携後にご利用いただけます。",
      },
      bankTransfer: {
        available: true,
        message: "申請後に運営から振込先をご案内します。",
      },
    },
    additionalCredits: additionalCredits.val,
    requests: requests.val,
  });
});

const createHandler = projectGuard.createHandlers(
  zValidator("json", createRequestSchema),
  async (c) => {
    const { projectId } = c.var.session;
    if (!projectId) {
      return c.json({ error: "プロジェクトが選択されていません。" }, 404);
    }

    const result = await c.var.creditPurchaseUseCase.createBankTransferRequest({
      projectId,
      ...c.req.valid("json"),
    });
    if (!result.ok) {
      if (result.val === CreditPurchaseUseCaseError.PendingRequestAlreadyExists) {
        return c.json({ error: "確認待ちの振込申請がすでにあります。" }, 409);
      }
      return c.json({ error: "振込申請の登録に失敗しました。" }, 500);
    }
    return c.json(result.val, 201);
  },
);

export const route = projectGuard
  .createApp()
  .get("/", ...getHandler)
  .post("/", ...createHandler);
