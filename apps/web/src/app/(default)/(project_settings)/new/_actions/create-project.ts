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
    const data = await response.json();
    if (response.status === 400 && "error" in data) {
      if (data.error === "ProjectAlreadyExists") {
        return submission.reply({
          fieldErrors: {
            projectId: ["このプロジェクトIDは既に使用されています"],
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
