"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { deleteProjectSchema } from "api/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteProjectAction(
  deleteTarget: string,
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: deleteProjectSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (submission.value.projectId !== deleteTarget) {
    return submission.reply({
      fieldErrors: {
        projectId: ["プロジェクトIDが一致しません"],
      },
    });
  }

  const client = createClient();

  const response = await client.admin.projects[":projectId"].$delete(
    { param: { projectId: submission.value.projectId } },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    return submission.reply({
      formErrors: ["プロジェクトの削除に失敗しました"],
    });
  }

  redirect("/");
}
