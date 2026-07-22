import { zValidator } from "@hono/zod-validator";
import { CreditPurchaseUseCaseError } from "@repo/module/error";
import { z } from "zod";
import { adminGuard } from "./_factory";

const idSchema = z.object({ id: z.string().min(1) });
const reviewSchema = z.object({ status: z.enum(["approved", "rejected"]) });

const getHandler = adminGuard.createHandlers(async (c) => {
  const result = await c.var.creditPurchaseUseCase.getAllForAdmin();
  if (!result.ok) {
    return c.json({ error: "購入申請の取得に失敗しました。" }, 500);
  }
  return c.json(result.val);
});

const reviewHandler = adminGuard.createHandlers(
  zValidator("param", idSchema),
  zValidator("json", reviewSchema),
  async (c) => {
    const result = await c.var.creditPurchaseUseCase.review({
      id: c.req.valid("param").id,
      status: c.req.valid("json").status,
    });
    if (!result.ok) {
      if (result.val === CreditPurchaseUseCaseError.RequestNotFound) {
        return c.json({ error: "購入申請が見つかりません。" }, 404);
      }
      if (result.val === CreditPurchaseUseCaseError.RequestAlreadyReviewed) {
        return c.json({ error: "この購入申請はすでに処理済みです。" }, 409);
      }
      return c.json({ error: "購入申請の更新に失敗しました。" }, 500);
    }
    return c.json(result.val);
  },
);

export const route = adminGuard
  .createApp()
  .get("/", ...getHandler)
  .patch("/:id", ...reviewHandler);
