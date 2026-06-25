"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { loginSchema } from "api/schema";
import { useFormState } from "react-dom";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";
import { loginAction } from "../_actions/login";

const loginLabel = css({
  color: "#3f3f46",
  fontWeight: 600,
});

const loginInput = css({
  color: "#18181b",
  caretColor: "#2F80ED",
  _placeholder: {
    color: "#71717a",
  },
});

export function LoginForm() {
  const [lastResult, formAction] = useFormState(loginAction, {});
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: "onBlur",
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
      <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.id.errors?.length}>
        <Field.Label className={loginLabel}>ID</Field.Label>
        <Field.Input asChild>
          <Input key={fields.id.key} name={fields.id.name} className={loginInput} />
        </Field.Input>
        {fields.id.errors?.map((error) => (
          <Field.ErrorText key={error}>{error}</Field.ErrorText>
        ))}
      </Field.Root>
      <Field.Root className={stack({ gap: 1.5 })} invalid={!!fields.password.errors?.length}>
        <Field.Label className={loginLabel}>パスワード</Field.Label>
        <Field.Input asChild>
          <Input
            type="password"
            key={fields.password.key}
            name={fields.password.name}
            className={loginInput}
          />
        </Field.Input>
        {fields.password.errors?.map((error) => (
          <Field.ErrorText key={error}>{error}</Field.ErrorText>
        ))}
      </Field.Root>
      <SubmitButton w="full">ログイン</SubmitButton>
    </form>
  );
}
