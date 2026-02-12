"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { deleteAuthSchema } from "api/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function deleteAuthAction(
  deleteTarget: string,
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: deleteAuthSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (submission.value.id !== deleteTarget) {
    return submission.reply({
      fieldErrors: {
        id: ["IDが一致しません"],
      },
    });
  }

  const client = createClient();

  const response = await client.admin.auth[":id"].$delete(
    { param: { id: submission.value.id } },
    { headers: { cookie: cookies().toString() } },
  );

  if (!response.ok) {
    return submission.reply({
      formErrors: ["認証情報のの削除に失敗しました"],
    });
  }

  redirect("/auth");
}
