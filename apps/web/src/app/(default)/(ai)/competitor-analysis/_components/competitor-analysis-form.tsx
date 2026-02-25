"use client";

import { useState } from "react";
import { Stack } from "styled-system/jsx";
import { FileUpload, Form, GenerateButton, OutputSection, Root } from "../../_components/form-fields";

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
        <OutputSection title="アカウント設計 / 投稿の傾向 / 強み / 弱み" />
      </Root>
    </Stack>
  );
}
