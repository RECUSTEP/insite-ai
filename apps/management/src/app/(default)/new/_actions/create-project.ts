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
  // Convert "true"/"false" string to boolean
  const seoAddonEnabledValue = formData.get("seoAddonEnabled");
  if (seoAddonEnabledValue === "true" || seoAddonEnabledValue === "false") {
    formData.set("seoAddonEnabled", seoAddonEnabledValue === "true" ? "1" : "0");
  }

  const submission = parseWithZod(formData, {
    schema: projectSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();

  const response = await client.admin.projects.$post(
    { json: submission.value },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    const errorMsg = data.error ?? "プロジェクトの作成に失敗しました";
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

  redirect("/");
}
