"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { useState } from "react";
import { Stack } from "styled-system/jsx";
import {
  FileUpload,
  Form,
  GenerateButton,
  Instruction,
  Output,
  Root,
} from "../../_components/form-fields";

export function ProfileForm(props: { placeholder?: string }) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Stack gap="12">
      <Root option={{ type: "profile" }}>
        <Form files={files}>
          <Stack gap="4">
            <FileUpload
              onFileAccept={(accepted) => {
                setFiles(accepted.files);
              }}
              required={false}
            />
            <SectionTitle>生成指示</SectionTitle>
            <Instruction placeholder={props.placeholder} />
            <GenerateButton />
          </Stack>
        </Form>
        <Stack gap="4">
          <SectionTitle>生成結果</SectionTitle>
          <Output />
        </Stack>
      </Root>
    </Stack>
  );
}
