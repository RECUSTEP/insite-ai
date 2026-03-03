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

    const response = await client.admin.projects[":projectId"].$patch(
      { param: { projectId }, json: { ...submission.value, seoAddonEnabled } },
      { headers: { cookie: cookies().toString() } },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      const errorMsg = data.error ?? "プロジェクトの編集に失敗しました";
      console.error("[updateProjectAction] API error:", response.status, errorMsg);
      return submission.reply({
        formErrors: [`プロジェクトの編集に失敗しました: ${errorMsg}`],
      });
    }
  } catch (e) {
    console.error("[updateProjectAction] Unexpected error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return submission.reply({
      formErrors: [`予期しないエラーが発生しました: ${msg}`],
    });
  }

  redirect("/");
}
