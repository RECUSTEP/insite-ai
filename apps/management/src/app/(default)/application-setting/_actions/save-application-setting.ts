"use server";

import { createClient } from "@/lib/api";
import type { SubmissionResult } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { applicationSettingSchema } from "api/schema";
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
    chatGptModel: chatGptModel ?? "",
    metaInsightEnabled: metaInsightEnabled === "true" ? "true" : "false",
    metaSocialChatEnabled: metaSocialChatEnabled === "true" ? "true" : "false",
    metaAccountLinkEnabled: metaAccountLinkEnabled === "true" ? "true" : "false",
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
