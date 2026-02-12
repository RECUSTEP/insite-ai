import { Text } from "@/components/ui/text";
import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";
import { UpdateAuthForm } from "./_components/update-auth-form";

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <VStack justifyContent="center" py="8" gap="8">
      <Text as="h1" size="xl">
        プロジェクトを編集
      </Text>
      <div className={css({ minW: "md" })}>
        <UpdateAuthForm id={params.id} />
      </div>
    </VStack>
  );
}
