"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { useFormState } from "react-dom";
import { stack } from "styled-system/patterns";
import type { z } from "zod";
import { authSchema, deleteAuthSchema } from "@repo/module/service";
import { deleteAuthAction } from "../_actoins/delete-auth-action";

type Auth = z.infer<typeof authSchema>;

type Props = {
  auth: Auth;
};

export function DeleteAuthForm({ auth }: Props) {
  const action = deleteAuthAction.bind(null, auth.id);
  const [authId, setProjectId] = useState("");
  const [lastResult, formAction] = useFormState(action, {});
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: deleteAuthSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  return (
    <form
      className={stack({ gap: 4 })}
      id={form.id}
      onSubmit={form.onSubmit}
      action={formAction}
      noValidate
    >
      <Field.Root
        className={stack({ gap: 1.5 })}
        invalid={!!fields.id.errors?.length || authId !== auth.id}
      >
        <Field.Label>削除するには「{auth.id}」を入力してください。</Field.Label>
        <Field.Input asChild>
          <Input
            key={fields.id.key}
            name={fields.id.name}
            value={authId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        </Field.Input>
      </Field.Root>
      <SubmitButton colorPalette="red" disabled={!!fields.id.errors?.length || authId !== auth.id}>
        削除
      </SubmitButton>
    </form>
  );
}
