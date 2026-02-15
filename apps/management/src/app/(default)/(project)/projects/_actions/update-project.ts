"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { projectSchema } from "api/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function updateProjectAction(
  projectId: string,
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

  const response = await client.admin.projects[":projectId"].$patch(
    { param: { projectId }, json: submission.value },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    return submission.reply({
      formErrors: ["プロジェクトの編集に失敗しました"],
    });
  }

  redirect("/");
}
