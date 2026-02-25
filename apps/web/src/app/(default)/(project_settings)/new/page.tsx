import { Text } from "@/components/ui/text";
import type { Metadata } from "next";
import { css } from "styled-system/css";
import { Flex } from "styled-system/jsx";
import { CreateProjectForm } from "./_components/create-project-form";

export const metadata: Metadata = {
  title: "プロジェクト新規作成",
};

export default async function Page() {
  return (
    <Flex
      gap={8}
      direction={"column"}
      className={css({ animation: "fadeIn 0.4s ease" })}
    >
      <Text
        as="h1"
        size="xl"
        className={css({
          fontWeight: 600,
          color: "text.primary",
        })}
      >
        プロジェクト新規作成
      </Text>
      <CreateProjectForm />
    </Flex>
  );
}
