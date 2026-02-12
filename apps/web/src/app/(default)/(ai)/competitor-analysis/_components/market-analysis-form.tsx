"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { Stack } from "styled-system/jsx";
import { FileUpload, Form, GenerateButton, Output, Root } from "../../_components/form-fields";
import { useState } from "react";

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
        <Stack gap="4">
          <SectionTitle>市場の動向 / 投稿の傾向 / 関連するハッシュタグ</SectionTitle>
          <Output />
        </Stack>
      </Root>
    </Stack>
  );
}
