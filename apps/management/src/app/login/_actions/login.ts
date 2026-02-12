"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { adminLoginSchema } from "api/schema";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: adminLoginSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();
  const response = await client.admin.login.$post({ json: submission.value });

  if (!response.ok) {
    return submission.reply({
      fieldErrors: {
        password: ["IDまたはパスワードが違います"],
      },
    });
  }

  const c = cookies();
  response.headers
    .getSetCookie()
    .map((cookie) => parseSetCookie(cookie))
    .map((cookie) => cookie && c.set(cookie.name, cookie.value, cookie));
  redirect("/");
}
