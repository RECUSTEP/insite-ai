"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { authSchema } from "@repo/module/service";
import { useFormState } from "react-dom";
import { stack } from "styled-system/patterns";
import type { z } from "zod";

type Schema = z.infer<typeof authSchema>;
type Props = {
  defaultValue?: { [K in keyof Schema]?: Schema[K] | null };
  isDisableIdField?: boolean;
  action: (submission: SubmissionResult, formData: FormData) => Promise<SubmissionResult>;
};

export function AuthForm({ defaultValue, isDisableIdField, action }: Props) {
  const [lastResult, formAction] = useFormState(action, {});
  const [form, fields] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: authSchema });
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
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.id.errors?.length}>
          <Field.Label>ID</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.id.key}
              name={fields.id.name}
              defaultValue={fields.id.initialValue}
              disabled={isDisableIdField}
              readOnly={isDisableIdField}
            />
          </Field.Input>
          {fields.id.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
        <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.password.errors?.length}>
          <Field.Label>パスワード</Field.Label>
          <Field.Input asChild>
            <Input
              key={fields.password.key}
              name={fields.password.name}
              defaultValue={fields.password.initialValue}
            />
          </Field.Input>
          {fields.password.errors?.map((error) => (
            <Field.ErrorText key={error}>{error}</Field.ErrorText>
          ))}
        </Field.Root>
      </div>
      <SubmitButton>登録</SubmitButton>
    </form>
  );
}
