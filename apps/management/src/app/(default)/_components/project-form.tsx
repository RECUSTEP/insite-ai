"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { projectSchema } from "api/schema";
import { useFormState } from "react-dom";
import { stack } from "styled-system/patterns";
import type { z } from "zod";

type Schema = z.infer<typeof projectSchema>;
type Props = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
  action: (submission: SubmissionResult, formData: FormData) => Promise<SubmissionResult>;
};

export function ProjectForm({ defaultValue, action }: Props) {
  const [lastResult, formAction] = useFormState(action, {});
  const [form, fields] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: projectSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
  });

  return (
    <form
      className={stack({ gap: 8 })}
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      noValidate
    >
      <input type="hidden" name="id" defaultValue={fields.id.initialValue} />
      <div className={stack({ gap: 4 })}>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.name.errors?.length}>
          <Field.Label>プロジェクト名</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.name.key}
              name={fields.name.name}
              defaultValue={fields.name.initialValue}
            />
          </Field.Input>
          {fields.name.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.managerName.errors?.length}>
          <Field.Label>担当者</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.managerName.key}
              name={fields.managerName.name}
              defaultValue={fields.managerName.initialValue}
            />
          </Field.Input>
          {fields.managerName.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.ownerName.errors?.length}>
          <Field.Label>プロジェクトオーナー</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.ownerName.key}
              name={fields.ownerName.name}
              defaultValue={fields.ownerName.initialValue}
            />
          </Field.Input>
          {fields.ownerName.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.projectId.errors?.length}>
          <Field.Label>プロジェクトID</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.projectId.key}
              name={fields.projectId.name}
              defaultValue={fields.projectId.initialValue}
              readOnly={!!fields.projectId.initialValue}
            />
          </Field.Input>
          {fields.projectId.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.authId.errors?.length}>
          <Field.Label>認証ID</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.authId.key}
              name={fields.authId.name}
              defaultValue={fields.authId.initialValue}
              readOnly={!!fields.authId.initialValue}
            />
          </Field.Input>
          {fields.authId.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.apiUsageLimit.errors?.length}>
          <Field.Label>API使用可能回数/月</Field.Label>
          <Field.Input asChild>
            <Input
              type="number"
              min="0"
              key={fields.apiUsageLimit.key}
              name={fields.apiUsageLimit.name}
              defaultValue={fields.apiUsageLimit.initialValue}
            />
          </Field.Input>
          {fields.apiUsageLimit.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
      </div>
      <SubmitButton>登録</SubmitButton>
    </form>
  );
}
