"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { authSchema } from "@repo/module/service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function updateAuthAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: authSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();

  const response = await client.admin.auth[":authId"].$patch(
    {
      param: {
        authId: submission.value.id,
      },
      json: submission.value,
    },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    return submission.reply({
      formErrors: ["認証情報の編集に失敗しました"],
    });
  }

  redirect("/auth");
}
