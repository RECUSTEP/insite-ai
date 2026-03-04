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

  try {
    const client = createClient();

    const payload = { ...submission.value };
    if (payload.companyName === "" || payload.companyName == null) {
      delete payload.companyName;
    }

    const response = await client.admin.auth.$post(
      { json: payload },
      { headers: { cookie: cookies().toString() } },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      console.error("[createAuthAction] API error:", response.status, data);
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
      const errorMsg = ("error" in data && data.error) ? String(data.error) : "";
      return submission.reply({
        formErrors: [errorMsg ? `認証情報の作成に失敗しました: ${errorMsg}` : "認証情報の作成に失敗しました"],
      });
    }
  } catch (e) {
    console.error("[createAuthAction] Unexpected error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return submission.reply({
      formErrors: [`予期しないエラーが発生しました: ${msg}`],
    });
  }

  redirect("/auth");
}
