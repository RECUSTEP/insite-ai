"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { saveInstructionGuideSchema } from "api/schema";
import { cookies } from "next/headers";
import type { z } from "zod";

function setDefaultEmptyString(value: z.infer<typeof saveInstructionGuideSchema>) {
  const result = { ...value };
  for (const key in saveInstructionGuideSchema.shape) {
    // @ts-ignore
    result[key] = result[key] ?? "";
  }
  return result;
}

export async function saveInstructionGuideAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: saveInstructionGuideSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();
  const response = await client.admin["instruction-guide"].$put(
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
