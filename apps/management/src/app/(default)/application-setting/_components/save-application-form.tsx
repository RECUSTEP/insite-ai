"use client";

import { SubmitButton } from "@/components/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { applicationSettingSchema } from "api/schema";
import { CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { useFormState } from "react-dom";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import { stack } from "styled-system/patterns";
import type { z } from "zod";
import { saveApplicationSettingAction } from "../_actions/save-application-setting";

type Schema = z.infer<typeof applicationSettingSchema>;
type Props = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
};

export function SaveApplicationSettingForm({ defaultValue }: Props) {
  const [lastResult, formAction] = useFormState(saveApplicationSettingAction, {});
  const [metaInsight, setMetaInsight] = useState(
    defaultValue?.metaInsightEnabled === "true",
  );
  const [metaSocialChat, setMetaSocialChat] = useState(
    defaultValue?.metaSocialChatEnabled === "true",
  );
  const [metaAccountLink, setMetaAccountLink] = useState(
    defaultValue?.metaAccountLinkEnabled === "true",
  );
  const [form, fields] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: applicationSettingSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form
      className={stack({ gap: 6 })}
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      noValidate
    >
      <input type="hidden" name="metaInsightEnabled" value={metaInsight ? "true" : "false"} />
      <input
        type="hidden"
        name="metaSocialChatEnabled"
        value={metaSocialChat ? "true" : "false"}
      />
      <input
        type="hidden"
        name="metaAccountLinkEnabled"
        value={metaAccountLink ? "true" : "false"}
      />
      <section className={stack({ gap: 6 })}>
        <Text as="h2" size="lg">
          ChatGPT設定
        </Text>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.openAiApiKey.errors?.length}>
          <Field.Label>OpenAI APIキー</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.openAiApiKey.key}
              name={fields.openAiApiKey.name}
              type="password"
              autoComplete="off"
              defaultValue={fields.openAiApiKey.initialValue}
              placeholder="sk-..."
            />
          </Field.Input>
          <Field.HelperText>
            既存のキーを維持する場合は変更しないでください。入力すると上書きされます。
          </Field.HelperText>
          {fields.openAiApiKey.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.chatGptModel.errors?.length}>
          <Field.Label>GhatGPTモデル</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.chatGptModel.key}
              name={fields.chatGptModel.name}
              defaultValue={fields.chatGptModel.initialValue}
              placeholder="gpt-4o"
            />
          </Field.Input>
          {fields.chatGptModel.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
      </section>

      <section className={stack({ gap: 4 })}>
        <Text as="h2" size="lg">
          Meta / Instagram・Threads 連携
        </Text>
        <Text size="sm" className={css({ color: "text.secondary" })}>
          ユーザー画面の分析AI（Meta インサイト・チャット・連携）の表示と API の利用可否を制御します。OAuth
          実装後に連携フローを接続してください。
        </Text>
        <Field.Root className={stack({ gap: 1.5 })}>
          <Checkbox checked={metaInsight} onCheckedChange={(d) => setMetaInsight(d.checked === true)}>
            Instagram・Threads インサイト分析タブを有効化
          </Checkbox>
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })}>
          <Checkbox
            checked={metaSocialChat}
            onCheckedChange={(d) => setMetaSocialChat(d.checked === true)}
          >
            Meta 連携チャットを有効化
          </Checkbox>
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })}>
          <Checkbox
            checked={metaAccountLink}
            onCheckedChange={(d) => setMetaAccountLink(d.checked === true)}
          >
            アカウント連携（OAuth）を有効化
          </Checkbox>
        </Field.Root>
      </section>

      <Box
        data-invalid={form.errors?.length ? "" : undefined}
        className={css({
          textAlign: "right",
          fontSize: "sm",
          display: "none",
          "&[data-invalid]": {
            display: "block",
            color: "fg.error",
          },
        })}
      >
        {form.errors?.map((error) => (
          <span key={error}>{error}</span>
        ))}
      </Box>
      <HStack ml="auto">
        <CheckCircleIcon
          size={18}
          data-type={lastResult.status}
          className={css({
            display: "none",
            "&[data-type=success]": {
              display: "block",
              color: "accent.default",
            },
          })}
        />
        <SubmitButton>保存</SubmitButton>
      </HStack>
    </form>
  );
}
