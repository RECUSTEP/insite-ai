"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { Stack } from "styled-system/jsx";
import { FileUpload, Form, GenerateButton, Output, Root } from "../../_components/form-fields";
import { useState } from "react";

export function InsightAnalysisForm() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Stack gap="12">
      <Root option={{ type: "insight" }}>
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
          <SectionTitle>改善提案</SectionTitle>
          <Output />
        </Stack>
      </Root>
    </Stack>
  );
}
