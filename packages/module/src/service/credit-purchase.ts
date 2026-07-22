import * as schemas from "@repo/db/schema";
import { and, between, desc, eq, sum } from "drizzle-orm";
import { Err, Ok, type Result } from "ts-results";
import { z } from "zod";
import type { Database } from "../core/db";
import { UseCase } from "../core/usecase";
import { CommonUseCaseError, CreditPurchaseUseCaseError } from "../error";
import type { CreditPurchaseRequestSelect } from "../schema";

export const CREDIT_PACKAGE_CREDITS = 100;
export const CREDIT_PACKAGE_AMOUNT_YEN = 2200;

export const createBankTransferRequestSchema = z.object({
  projectId: z.string().min(1),
  transferName: z.string().trim().min(1).max(100),
  note: z.string().trim().max(500).optional(),
});

export const reviewCreditPurchaseSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
});

export type AdminCreditPurchaseRequest = CreditPurchaseRequestSelect & {
  projectName: string;
  authId: string;
  companyName: string | null;
};

function getCurrentJstMonthRange(nowMs = Date.now()) {
  const offset = 9 * 60 * 60 * 1000;
  const now = new Date(nowMs + offset);
  return {
    start: Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - offset,
    end: Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - offset - 1,
  };
}

export class CreditPurchaseUseCase<T extends "d1" | "libsql"> extends UseCase<T> {
  async createBankTransferRequest(
    input: z.infer<typeof createBankTransferRequestSchema>,
  ): Promise<Result<CreditPurchaseRequestSelect, string>> {
    const parsed = createBankTransferRequestSchema.safeParse(input);
    if (!parsed.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }

    try {
      const project = await this.db.query.projects.findFirst({
        where: eq(schemas.projects.projectId, parsed.data.projectId),
      });
      if (!project) {
        return Err(CreditPurchaseUseCaseError.ProjectNotFound);
      }

      const pending = await this.db.query.creditPurchaseRequests.findFirst({
        where: and(
          eq(schemas.creditPurchaseRequests.projectId, parsed.data.projectId),
          eq(schemas.creditPurchaseRequests.status, "pending"),
        ),
      });
      if (pending) {
        return Err(CreditPurchaseUseCaseError.PendingRequestAlreadyExists);
      }

      const now = Date.now();
      const [created] = await this.db
        .insert(schemas.creditPurchaseRequests)
        .values({
          projectId: parsed.data.projectId,
          paymentMethod: "bank_transfer",
          transferName: parsed.data.transferName,
          note: parsed.data.note || null,
          credits: CREDIT_PACKAGE_CREDITS,
          amountYen: CREDIT_PACKAGE_AMOUNT_YEN,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return created ? Ok(created) : Err(CommonUseCaseError.UnknownError);
    } catch (error) {
      console.error("[CreditPurchaseUseCase.createBankTransferRequest]", error);
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getByProjectId(projectId: string): Promise<Result<CreditPurchaseRequestSelect[], string>> {
    if (!projectId) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    try {
      const requests = await this.db.query.creditPurchaseRequests.findMany({
        where: eq(schemas.creditPurchaseRequests.projectId, projectId),
        orderBy: desc(schemas.creditPurchaseRequests.createdAt),
      });
      return Ok(requests);
    } catch (error) {
      console.error("[CreditPurchaseUseCase.getByProjectId]", error);
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getAllForAdmin(): Promise<Result<AdminCreditPurchaseRequest[], string>> {
    try {
      const db = this.db as Database<"d1">;
      const rows = await db
        .select({
          id: schemas.creditPurchaseRequests.id,
          projectId: schemas.creditPurchaseRequests.projectId,
          paymentMethod: schemas.creditPurchaseRequests.paymentMethod,
          transferName: schemas.creditPurchaseRequests.transferName,
          note: schemas.creditPurchaseRequests.note,
          credits: schemas.creditPurchaseRequests.credits,
          amountYen: schemas.creditPurchaseRequests.amountYen,
          status: schemas.creditPurchaseRequests.status,
          createdAt: schemas.creditPurchaseRequests.createdAt,
          updatedAt: schemas.creditPurchaseRequests.updatedAt,
          reviewedAt: schemas.creditPurchaseRequests.reviewedAt,
          approvedAt: schemas.creditPurchaseRequests.approvedAt,
          projectName: schemas.projects.name,
          authId: schemas.projects.authId,
          companyName: schemas.auth.companyName,
        })
        .from(schemas.creditPurchaseRequests)
        .innerJoin(
          schemas.projects,
          eq(schemas.creditPurchaseRequests.projectId, schemas.projects.projectId),
        )
        .innerJoin(schemas.auth, eq(schemas.projects.authId, schemas.auth.id))
        .orderBy(desc(schemas.creditPurchaseRequests.createdAt));
      return Ok(rows);
    } catch (error) {
      console.error("[CreditPurchaseUseCase.getAllForAdmin]", error);
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async getApprovedCreditsForCurrentMonth(projectId: string): Promise<Result<number, string>> {
    if (!projectId) {
      return Err(CommonUseCaseError.InvalidInput);
    }
    try {
      const { start, end } = getCurrentJstMonthRange();
      const db = this.db as Database<"d1">;
      const [row] = await db
        .select({ credits: sum(schemas.creditPurchaseRequests.credits) })
        .from(schemas.creditPurchaseRequests)
        .where(
          and(
            eq(schemas.creditPurchaseRequests.projectId, projectId),
            eq(schemas.creditPurchaseRequests.status, "approved"),
            between(schemas.creditPurchaseRequests.approvedAt, start, end),
          ),
        );
      return Ok(Number(row?.credits ?? 0));
    } catch (error) {
      console.error("[CreditPurchaseUseCase.getApprovedCreditsForCurrentMonth]", error);
      return Err(CommonUseCaseError.UnknownError);
    }
  }

  async review(
    input: z.infer<typeof reviewCreditPurchaseSchema>,
  ): Promise<Result<CreditPurchaseRequestSelect, string>> {
    const parsed = reviewCreditPurchaseSchema.safeParse(input);
    if (!parsed.success) {
      return Err(CommonUseCaseError.InvalidInput);
    }

    try {
      const existing = await this.db.query.creditPurchaseRequests.findFirst({
        where: eq(schemas.creditPurchaseRequests.id, parsed.data.id),
      });
      if (!existing) {
        return Err(CreditPurchaseUseCaseError.RequestNotFound);
      }
      if (existing.status !== "pending") {
        return Err(CreditPurchaseUseCaseError.RequestAlreadyReviewed);
      }

      const now = Date.now();
      const [updated] = await this.db
        .update(schemas.creditPurchaseRequests)
        .set({
          status: parsed.data.status,
          updatedAt: now,
          reviewedAt: now,
          approvedAt: parsed.data.status === "approved" ? now : null,
        })
        .where(
          and(
            eq(schemas.creditPurchaseRequests.id, parsed.data.id),
            eq(schemas.creditPurchaseRequests.status, "pending"),
          ),
        )
        .returning();
      return updated ? Ok(updated) : Err(CreditPurchaseUseCaseError.RequestAlreadyReviewed);
    } catch (error) {
      console.error("[CreditPurchaseUseCase.review]", error);
      return Err(CommonUseCaseError.UnknownError);
    }
  }
}
