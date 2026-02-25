"use client";

import { useState } from "react";
import { Stack } from "styled-system/jsx";
import { FileUpload, Form, GenerateButton, OutputSection, Root } from "../../_components/form-fields";

export function MarketAnalysisForm() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Stack gap="12">
      <Root option={{ type: "market" }}>
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
        <OutputSection title="市場の動向 / 投稿の傾向 / 関連するハッシュタグ" />
      </Root>
    </Stack>
  );
}
