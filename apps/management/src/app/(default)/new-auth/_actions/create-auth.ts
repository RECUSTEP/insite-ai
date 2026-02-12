"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { AuthUseCaseError } from "@repo/module/error";
import { authSchema } from "@repo/module/service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createAuthAction(
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

  const response = await client.admin.auth.$post(
    { json: submission.value },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    const data = await response.json();
    if (
      response.status === 400 &&
      "error" in data &&
      data.error === AuthUseCaseError.AuthAlreadyExists
    ) {
      return submission.reply({
        fieldErrors: {
          id: ["このIDは既に使用されています"],
        },
      });
    }
    return submission.reply({
      formErrors: ["認証情報の作成に失敗しました"],
    });
  }

  redirect("/auth");
}
