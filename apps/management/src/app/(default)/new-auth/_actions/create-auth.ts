"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { AuthUseCaseError, ProjectUseCaseError } from "@repo/module/error";
import { authSchema } from "@repo/module/service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_API_USAGE_LIMIT = 1000;

export async function createAuthAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: authSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const client = createClient();

    const payload = { ...submission.value };
    if (payload.companyName === "" || payload.companyName == null) {
      delete payload.companyName;
    }

    const authResponse = await client.admin.auth.$post(
      { json: payload },
      { headers: { cookie: cookies().toString() } },
    );

    if (!authResponse.ok) {
      const data = (await authResponse.json().catch(() => ({}))) as { error?: string };
      console.error("[createAuthAction] API error:", authResponse.status, data);
      if (
        authResponse.status === 400 &&
        "error" in data &&
        data.error === AuthUseCaseError.AuthAlreadyExists
      ) {
        return submission.reply({
          fieldErrors: {
            id: ["このIDは既に使用されています"],
          },
        });
      }
      const errorMsg = ("error" in data && data.error) ? String(data.error) : "";
      return submission.reply({
        formErrors: [errorMsg ? `認証情報の作成に失敗しました: ${errorMsg}` : "認証情報の作成に失敗しました"],
      });
    }

    const auth = (await authResponse.json()) as { id: string };
    const authId = auth.id;

    const projectId = `${authId}-default`;
    const projectPayload = {
      name: payload.companyName?.trim() ? `${payload.companyName}のプロジェクト` : "デフォルトプロジェクト",
      managerName: "担当者",
      ownerName: "オーナー",
      projectId,
      apiUsageLimit: DEFAULT_API_USAGE_LIMIT,
      authId,
    };

    const projectResponse = await client.admin.projects.$post(
      { json: projectPayload },
      { headers: { cookie: cookies().toString() } },
    );

    if (!projectResponse.ok) {
      const data = (await projectResponse.json().catch(() => ({}))) as { error?: string };
      console.error("[createAuthAction] Project creation failed:", projectResponse.status, data);
      if (
        projectResponse.status === 400 &&
        "error" in data &&
        data.error === ProjectUseCaseError.ProjectAlreadyExists
      ) {
        return submission.reply({
          formErrors: ["認証は作成されましたが、プロジェクトの自動作成に失敗しました（プロジェクトIDが重複しています）"],
        });
      }
      return submission.reply({
        formErrors: ["認証は作成されましたが、プロジェクトの自動作成に失敗しました"],
      });
    }
  } catch (e) {
    console.error("[createAuthAction] Unexpected error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return submission.reply({
      formErrors: [`予期しないエラーが発生しました: ${msg}`],
    });
  }

  redirect("/auth");
}
