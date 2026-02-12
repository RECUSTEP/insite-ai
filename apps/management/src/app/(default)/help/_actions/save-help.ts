"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { helpSchema } from "api/schema";
import { cookies } from "next/headers";
import type { z } from "zod";

function setDefaultEmptyString(value: z.infer<typeof helpSchema>) {
  const result = { ...value };
  for (const key in helpSchema.shape) {
    // @ts-ignore
    result[key] = result[key] ?? "";
  }
  return result;
}

export async function saveHelpAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: helpSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();
  const response = await client.admin.helps.$put(
    {
      json: setDefaultEmptyString(submission.value),
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    return submission.reply({
      formErrors: ["プロジェクト情報の保存に失敗しました"],
    });
  }

  return submission.reply();
}
