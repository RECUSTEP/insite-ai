"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { projectInfoSchema } from "api/schema";
import { CheckCircleIcon } from "lucide-react";
import { useFormState } from "react-dom";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import { stack } from "styled-system/patterns";
import type { z } from "zod";
import { SectionTitle } from "../../_components/section-title";
import { saveProjectInfoAction } from "../_actions/project-info";
import { useEffect } from "react";

const formFields = {
  business: [
    {
      label: "業種",
      key: "businessType",
    },
    {
      label: "住所",
      key: "address",
    },
    {
      label: "最寄り駅",
      key: "nearestStation",
    },
    {
      label: "お店のコンセプト",
      key: "concept",
    },
    {
      label: "自社の強み・差別化ポイント",
      key: "strength",
    },
  ],
  target: [
    {
      label: "年齢",
      key: "targetAge",
    },
    {
      label: "性別",
      key: "targetGender",
    },
    {
      label: "地域",
      key: "targetArea",
    },
    {
      label: "属性",
      key: "targetAttribute",
    },
    {
      label: "悩み",
      key: "targetConcern",
    },
  ],
} as const satisfies Record<
  string,
  { label: string; key: keyof z.infer<typeof projectInfoSchema> }[]
>;

type Schema = z.infer<typeof projectInfoSchema>;
type ProjectInfoFormProps = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
};

export function ProjectInfoForm({ defaultValue }: ProjectInfoFormProps) {
  const [lastResult, formAction] = useFormState(saveProjectInfoAction, {});
  const [form, fields] = useForm({
    defaultValue: defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: projectInfoSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    form.reset();
  }, [defaultValue]);

  return (
    <form
      className={stack({ gap: 6 })}
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      noValidate
    >
      <section className={stack({ gap: 4 })}>
        <SectionTitle>ビジネスの概要</SectionTitle>
        {formFields.business.map((field) => (
          <Field.Root
            key={field.key}
            className={stack({ gap: 1.5 })}
            invalid={!!fields[field.key].errors?.length}
          >
            <Field.Label>{field.label}</Field.Label>
            <Field.Textarea asChild>
              <Textarea
                key={fields[field.key].key}
                name={fields[field.key].name}
                defaultValue={fields[field.key].initialValue}
                rows={1}
                resize="none"
                adjustHeight
              />
            </Field.Textarea>
            {fields[field.key].errors?.map((error) => (
              <Field.ErrorText key={error}>{error}</Field.ErrorText>
            ))}
          </Field.Root>
        ))}
      </section>
      <section className={stack({ gap: 4 })}>
        <SectionTitle>ターゲット層</SectionTitle>
        {formFields.target.map((field) => (
          <Field.Root
            key={field.key}
            className={stack({ gap: 1.5 })}
            invalid={!!fields[field.key].errors?.length}
          >
            <Field.Label>{field.label}</Field.Label>
            <Field.Textarea asChild>
              <Textarea
                key={fields[field.key].key}
                name={fields[field.key].name}
                defaultValue={fields[field.key].initialValue}
                rows={1}
                resize="none"
                adjustHeight
              />
            </Field.Textarea>
            {fields[field.key].errors?.map((error) => (
              <Field.ErrorText key={error}>{error}</Field.ErrorText>
            ))}
          </Field.Root>
        ))}
      </section>
      <section className={stack({ gap: 4 })}>
        <SectionTitle>既存顧客の分析</SectionTitle>
        <Field.Root
          className={stack({ gap: 1.5 })}
          invalid={!!fields.existingCustomerAnalysis.errors?.length}
        >
          <Field.Textarea asChild>
            <Textarea
              key={fields.existingCustomerAnalysis.key}
              name={fields.existingCustomerAnalysis.name}
              defaultValue={fields.existingCustomerAnalysis.initialValue}
              rows={3}
              resize="none"
              adjustHeight
            />
          </Field.Textarea>
          {fields.existingCustomerAnalysis.errors?.map((error) => (
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
