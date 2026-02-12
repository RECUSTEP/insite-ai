import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import Link from "next/link";
import { Container, Flex, HStack } from "styled-system/jsx";
import { z } from "zod";
import { AuthTable } from "./_components/auth-table";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const searchParamsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .catch(() => 1),
});

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { page } = searchParamsSchema.parse(searchParams);
  const client = createClient();
  const response = await client.admin.auth.$get(
    {
      query: {
        offset: `${(page - 1) * 20}`,
        limit: "20",
      },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch help info");
  }
  const { auth, hasNext } = await response.json();
  return (
    <Container py={10}>
      <Flex mb={10} justify="flex-end">
        <Button asChild>
          <Link href="/new-auth">新しい認証を作成</Link>
        </Button>
      </Flex>
      <AuthTable authList={auth} />
      <HStack justify="center" pt={8}>
        <PaginationButton direction="prev" page={page} hasNext={hasNext}>
          前のページ
        </PaginationButton>
        <PaginationButton direction="next" page={page} hasNext={hasNext}>
          次のページ
        </PaginationButton>
      </HStack>
    </Container>
  );
}

type PaginationButtonProps = {
  direction: "prev" | "next";
  page: number;
  hasNext: boolean;
  children: React.ReactNode;
};

function PaginationButton({ direction, page, hasNext, children }: PaginationButtonProps) {
  const disabled = direction === "prev" ? page === 1 : !hasNext;
  const href = direction === "prev" ? `/?page=${page - 1}` : `/?page=${page + 1}`;
  const content = (
    <>
      {direction === "prev" && <ArrowLeftIcon />}
      {children}
      {direction === "next" && <ArrowRightIcon />}
    </>
  );

  return (
    <Button
      asChild
      disabled={disabled}
      variant="outline"
      color="accent.text"
      _disabled={{ color: "fg.disabled" }}
    >
      {disabled ? <span>{content}</span> : <Link href={href}>{content}</Link>}
    </Button>
  );
}
