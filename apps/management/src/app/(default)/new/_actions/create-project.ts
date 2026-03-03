"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ProjectUseCaseError } from "@repo/module/error";
import { projectSchema } from "api/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createProjectAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  // seoAddonEnabled は "true"/"false" 文字列で来るため、手動で boolean に変換してから除去
  const seoAddonEnabledRaw = formData.get("seoAddonEnabled");
  const seoAddonEnabled = seoAddonEnabledRaw === "true";
  formData.delete("seoAddonEnabled");

  const submission = parseWithZod(formData, {
    schema: projectSchema.omit({ seoAddonEnabled: true }),
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const client = createClient();

    const response = await client.admin.projects.$post(
      { json: { ...submission.value, seoAddonEnabled } },
      { headers: { cookie: cookies().toString() } },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      const errorMsg = data.error ?? "プロジェクトの作成に失敗しました";
      console.error("[createProjectAction] API error:", response.status, errorMsg);
      if (response.status === 400 && errorMsg) {
        if (errorMsg === ProjectUseCaseError.ProjectAlreadyExists) {
          return submission.reply({
            fieldErrors: {
              projectId: ["このプロジェクトIDは既に使用されています"],
            },
          });
        }
        if (errorMsg === ProjectUseCaseError.AuthNotFound) {
          return submission.reply({
            fieldErrors: {
              authId: ["この認証IDは存在しません"],
            },
          });
        }
        const displayMsg =
          errorMsg === "UnknownError"
            ? "プロジェクトの作成に失敗しました。しばらくしてから再度お試しください。"
            : errorMsg.startsWith("UnknownError: ")
              ? `作成に失敗しました: ${errorMsg.slice(14)}`
              : errorMsg;
        return submission.reply({
          formErrors: [displayMsg],
        });
      }

      return submission.reply({
        formErrors: ["プロジェクトの作成に失敗しました"],
      });
    }
  } catch (e) {
    console.error("[createProjectAction] Unexpected error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return submission.reply({
      formErrors: [`予期しないエラーが発生しました: ${msg}`],
    });
  }

  redirect("/");
}
