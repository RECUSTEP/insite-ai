"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { Stack } from "styled-system/jsx";
import { Form, GenerateButton, Instruction, Output, Root } from "../../_components/form-fields";

export function NoImageForm(props: { placeholder?: string }) {
  return (
    <Stack gap="12">
      <Root option={{ type: "google-map-no-image" }}>
        <Form>
          <Stack gap="4">
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
