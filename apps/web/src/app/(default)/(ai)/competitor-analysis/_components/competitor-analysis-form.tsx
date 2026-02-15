"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { useState } from "react";
import { Stack } from "styled-system/jsx";
import { FileUpload, Form, GenerateButton, Output, Root } from "../../_components/form-fields";

export function CompetitorAnalysisForm() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Stack gap="12">
      <Root option={{ type: "competitor" }}>
        <Form files={files}>
          <Stack gap="4">
            <FileUpload
              onFileAccept={(accepted) => {
                setFiles(accepted.files);
              }}
            />
            <GenerateButton />
          </Stack>
        </Form>
        <Stack gap="4">
          <SectionTitle>アカウント設計 / 投稿の傾向 / 強み / 弱み</SectionTitle>
          <Output />
        </Stack>
      </Root>
    </Stack>
  );
}
