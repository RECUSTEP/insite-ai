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
    const data = await response.json();
    if (response.status === 400 && "error" in data) {
      if (data.error === ProjectUseCaseError.ProjectAlreadyExists) {
        return submission.reply({
          fieldErrors: {
            projectId: ["このプロジェクトIDは既に使用されています"],
          },
        });
      }
      if (data.error === ProjectUseCaseError.AuthNotFound) {
        return submission.reply({
          fieldErrors: {
            authId: ["この認証IDは存在しません"],
          },
        });
      }
    }

    return submission.reply({
      formErrors: ["プロジェクトの作成に失敗しました"],
    });
  }

  redirect("/");
}
