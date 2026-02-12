"use client";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { saveInstructionGuideSchema } from "api/schema";
import { CheckCircleIcon } from "lucide-react";
import { useCallback } from "react";
import { useFormState } from "react-dom";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import { stack } from "styled-system/patterns";
import type { z } from "zod";
import { saveInstructionGuideAction } from "../_actions/save-instruction-guide";

type Schema = z.infer<typeof saveInstructionGuideSchema>;
type Props = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
};

type FieldConfig = {
  label: string;
  key: keyof Schema;
  section: string;
};

const fieldConfigs: FieldConfig[] = [
  { label: "AIコンサルタント", key: "improvement", section: "AI店舗運営" },
  { label: "AI相談", key: "improvement-no-image", section: "AI店舗運営" },
  { label: "フィード投稿", key: "feed-post", section: "ライティングAI（Instagram）" },
  { label: "リール", key: "reel-and-stories", section: "ライティングAI（Instagram）" },
  { label: "プロフィール", key: "profile", section: "ライティングAI（Instagram）" },
  { label: "画像あり", key: "google-map", section: "ライティングAI（Google Map）" },
  { label: "画像なし", key: "google-map-no-image", section: "ライティングAI（Google Map）" },
];

export function SaveInstructionGuideForm({ defaultValue }: Props) {
  const [lastResult, formAction] = useFormState(saveInstructionGuideAction, {});
  const [form, fields] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: saveInstructionGuideSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const renderField = useCallback(
    (fieldConfig: FieldConfig) => {
      const field = fields[fieldConfig.key];
      return (
        <Field.Root
          key={fieldConfig.key}
          className={stack({ gap: 1.5 })}
          invalid={!!field.errors?.length}
        >
          <Field.Label>{fieldConfig.label}</Field.Label>
          <Field.Textarea asChild>
            <Textarea
              key={field.key}
              name={field.name}
              defaultValue={field.initialValue}
              rows={3}
              resize="none"
              adjustHeight
            />
          </Field.Textarea>
          {field.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
      );
    },
    [fields],
  );

  const renderSection = useCallback(
    (sectionName: string) => {
      const sectionFields = fieldConfigs.filter((config) => config.section === sectionName);
      return (
        <section key={sectionName} className={stack({ gap: 6 })}>
          <Text as="h2" size="lg">
            {sectionName}
          </Text>
          {sectionFields.map(renderField)}
        </section>
      );
    },
    [renderField],
  );

  const uniqueSections = Array.from(new Set(fieldConfigs.map((config) => config.section)));

  return (
    <form
      className={stack({ gap: 6 })}
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      noValidate
    >
      {uniqueSections.map(renderSection)}
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
