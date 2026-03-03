"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { projectInfoSchema } from "api/schema";
import { cookies } from "next/headers";
import type { z } from "zod";

function setDefaultEmptyString(value: z.infer<typeof projectInfoSchema>) {
  const result = { ...value };
  for (const key in projectInfoSchema.shape) {
    // @ts-ignore
    result[key] = result[key] ?? "";
  }
  return result;
}

export async function saveProjectInfoAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: projectInfoSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const client = createClient();
    const response = await client.project_info.$put(
      { json: setDefaultEmptyString(submission.value) },
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      const errorMsg = data.error ?? "プロジェクト情報の保存に失敗しました";
      console.error("[saveProjectInfoAction] API error:", response.status, errorMsg);
      const displayMsg =
        errorMsg === "UnknownError"
          ? "プロジェクト情報の保存に失敗しました。しばらくしてから再度お試しください。"
          : errorMsg.startsWith("UnknownError: ")
            ? `保存に失敗しました: ${errorMsg.slice(14)}`
            : errorMsg;
      return submission.reply({
        formErrors: [displayMsg],
      });
    }
  } catch (e) {
    console.error("[saveProjectInfoAction] Unexpected error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return submission.reply({
      formErrors: [`予期しないエラーが発生しました: ${msg}`],
    });
  }

  return submission.reply();
}
