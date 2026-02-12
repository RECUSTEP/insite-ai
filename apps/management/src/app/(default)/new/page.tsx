import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";
import { CreateProjectForm } from "./_components/create-project-form";

export default function Page() {
  return (
    <VStack justifyContent="center" py="8" gap="8">
      <Text as="h1" size="xl">
        新しいプロジェクト
      </Text>
      <div className={css({ minW: "md" })}>
        <CreateProjectForm />
      </div>
    </VStack>
  );
}
