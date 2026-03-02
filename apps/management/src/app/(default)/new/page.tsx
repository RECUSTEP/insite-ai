import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";
import { z } from "zod";
import { CreateProjectForm } from "./_components/create-project-form";

const searchParamsSchema = z.object({
  authId: z.string().optional(),
});

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { authId } = searchParamsSchema.parse(searchParams);

  return (
    <VStack justifyContent="center" py="8" gap="8">
      <Text as="h1" size="xl">
        新しいプロジェクト
      </Text>
      <div className={css({ minW: "md" })}>
        <CreateProjectForm defaultAuthId={authId} />
      </div>
    </VStack>
  );
}
