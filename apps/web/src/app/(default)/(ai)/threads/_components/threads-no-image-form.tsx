"use client";

import { SectionTitle } from "@/app/(default)/_components/section-title";
import { Stack } from "styled-system/jsx";
import {
  Form,
  GenerateButton,
  Instruction,
  OutputSection,
  Root,
} from "../../_components/form-fields";

export function ThreadsNoImageForm(props: { placeholder?: string }) {
  return (
    <Stack gap="12">
      <Root option={{ type: "threads-no-image" }}>
        <Form>
          <Stack gap="4">
            <SectionTitle>生成指示</SectionTitle>
            <Instruction placeholder={props.placeholder} />
            <GenerateButton />
          </Stack>
        </Form>
        <OutputSection />
      </Root>
    </Stack>
  );
}
