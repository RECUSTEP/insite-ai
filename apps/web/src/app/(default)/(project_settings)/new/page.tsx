import { Text } from "@/components/ui/text";
import type { Metadata } from "next";
import { Flex } from "styled-system/jsx";
import { CreateProjectForm } from "./_components/create-project-form";

export const metadata: Metadata = {
  title: "プロジェクト新規作成",
};

export default async function Page() {
  return (
    <Flex gap={8} direction={"column"}>
      <Text as="h1" size="xl">
        プロジェクト新規作成
      </Text>
      <CreateProjectForm />
    </Flex>
  );
}
