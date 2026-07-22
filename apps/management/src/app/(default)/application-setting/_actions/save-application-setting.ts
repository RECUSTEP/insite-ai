"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { applicationSettingSchema, testOpenAiConnectionSchema } from "api/schema";
import { cookies } from "next/headers";
import type { z } from "zod";

function setDefaultEmptyString(value: z.infer<typeof applicationSettingSchema>) {
  const {
    openAiApiKey,
    chatGptModel,
    metaInsightEnabled,
    metaSocialChatEnabled,
    metaAccountLinkEnabled,
  } = value;
  return {
    openAiApiKey: openAiApiKey ?? "",
    chatGptModel: chatGptModel ?? "gpt-4o-mini",
    metaInsightEnabled: (metaInsightEnabled === "true" ? "true" : "false") as "true" | "false",
    metaSocialChatEnabled: (metaSocialChatEnabled === "true" ? "true" : "false") as
      | "true"
      | "false",
    metaAccountLinkEnabled: (metaAccountLinkEnabled === "true" ? "true" : "false") as
      | "true"
      | "false",
  };
}

export async function saveApplicationSettingAction(
  _: SubmissionResult,
  formData: FormData,
): Promise<SubmissionResult> {
  const submission = parseWithZod(formData, {
    schema: applicationSettingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const client = createClient();
  const response = await client.admin["application-settings"].$put(
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
      formErrors: ["アプリケーション設定の保存に失敗しました"],
    });
  }

  return submission.reply();
}

export type OpenAiConnectionTestResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function testOpenAiConnectionAction(
  formData: FormData,
): Promise<OpenAiConnectionTestResult> {
  const submission = parseWithZod(formData, {
    schema: testOpenAiConnectionSchema,
  });

  if (submission.status !== "success") {
    return { ok: false, message: "APIキーとモデルの入力内容を確認してください。" };
  }

  const client = createClient();
  const response = await client.admin["application-settings"]["test-openai"].$post(
    {
      json: submission.value,
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );
  const result = await response.json();

  if (!response.ok || !result.ok) {
    return {
      ok: false,
      message: "error" in result ? result.error : "OpenAIへの接続を確認できませんでした。",
    };
  }

  return {
    ok: true,
    message: `${result.model} へ接続できました。`,
  };
}
