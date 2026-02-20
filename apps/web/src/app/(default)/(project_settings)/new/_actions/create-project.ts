"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { createProjectSchema } from "api/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createProjectAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: createProjectSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();

  const response = await client.project.$post(
    { json: submission.value },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    const errorMsg = data.error ?? "プロジェクトの作成に失敗しました";
    if (response.status === 400 && errorMsg) {
      if (errorMsg === "ProjectAlreadyExists") {
        return submission.reply({
          fieldErrors: {
            projectId: ["このプロジェクトIDは既に使用されています"],
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
