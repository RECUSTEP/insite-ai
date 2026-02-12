import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { HistoryDetail } from "./_components/history-detail";

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <>
      <Button asChild variant="ghost" mb={4} px={2} ml={-2} color="fg.muted">
        <Link href="/history">
          <ArrowLeftIcon />
          戻る
        </Link>
      </Button>
      <Text as="h1" size="xl" mb={8}>
        利用履歴
      </Text>
      <HistoryDetail id={params.id} />
    </>
  );
}
