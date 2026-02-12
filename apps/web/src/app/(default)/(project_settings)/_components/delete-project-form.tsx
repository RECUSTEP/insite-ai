"use client";

import { Text } from "@/components/ui/text";
import { SubmitButton } from "@/components/submit-button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { deleteProjectSchema_, type projectSchema } from "api/schema";
import { stack } from "styled-system/patterns";
import { type z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = z.infer<typeof projectSchema>;

type Props = {
  projectId: Project["projectId"];
  onCompleted?: () => void;
};

export function DeleteProjectForm(props: Props) {
  const router = useRouter();
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: deleteProjectSchema_ });
    },
    onSubmit(e) {
      e.preventDefault();
      handleSubmit(e);
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/project/${form.value?.projectId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      if (props.onCompleted) {
        props.onCompleted();
      }
      form.reset();
      router.refresh();
    } else {
      const errBody = (await res.json()) as { error?: string };
      setError(errBody.error ?? "");
    }
  };

  return (
    <form className={stack({ gap: 4 })} id={form.id} onSubmit={form.onSubmit} noValidate>
      <Field.Root
        className={stack({ gap: 1.5 })}
        invalid={!!fields.projectId.errors?.length || projectId !== props.projectId}
      >
        <Field.Label>削除するには「{props.projectId}」を入力してください。</Field.Label>
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
        disabled={!!fields.projectId.errors?.length || projectId !== props.projectId}
      >
        削除
      </SubmitButton>
      <Text fontWeight="bold" color="red">
        {error}
      </Text>
    </form>
  );
}
