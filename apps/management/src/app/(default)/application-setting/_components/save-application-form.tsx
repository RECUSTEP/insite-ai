"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { applicationSettingSchema } from "api/schema";
import { CheckCircleIcon } from "lucide-react";
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
              defaultValue={fields.openAiApiKey.initialValue}
              placeholder="sk-..."
            />
          </Field.Input>
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
