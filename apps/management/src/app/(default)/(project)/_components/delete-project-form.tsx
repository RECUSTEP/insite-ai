"use client";

import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { deleteProjectSchema, type projectSchema } from "api/schema";
import { useState } from "react";
import { useFormState } from "react-dom";
import { stack } from "styled-system/patterns";
import type { z } from "zod";
import { deleteProjectAction } from "../_actoins/delete-project-action";

type Project = z.infer<typeof projectSchema>;

type Props = {
  project: Project;
};

export function DeleteProjectForm({ project }: Props) {
  const action = deleteProjectAction.bind(null, project.projectId);
  const [projectId, setProjectId] = useState("");
  const [lastResult, formAction] = useFormState(action, {});
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: deleteProjectSchema });
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
        invalid={!!fields.projectId.errors?.length || projectId !== project.projectId}
      >
        <Field.Label>削除するには「{project.projectId}」を入力してください。</Field.Label>
        <Field.Input asChild>
          <Input
            key={fields.projectId.key}
            name={fields.projectId.name}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        </Field.Input>
      </Field.Root>
      <SubmitButton
        colorPalette="red"
        disabled={!!fields.projectId.errors?.length || projectId !== project.projectId}
      >
        削除
      </SubmitButton>
    </form>
  );
}
