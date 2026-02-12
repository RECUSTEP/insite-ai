import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/api";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Container, Flex, HStack } from "styled-system/jsx";
import { ProjectTable } from "./_components/project-table";
import { SearchInput } from "./_components/search-input";
import { renderSearchParams, searchParamsSchema } from "./_components/searchParams";

const PAGE_SIZE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { page, column, text } = searchParamsSchema.parse(searchParams);
  const client = createClient();
  const response = await client.admin.projects.$get(
    {
      query: {
        offset: `${(page - 1) * PAGE_SIZE}`,
        limit: `${PAGE_SIZE}`,
        searchColumnName: column,
        searchText: text,
      },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const projects = await response.json();

  return (
    <Container py={10}>
      <Flex mb={10} justify="space-between">
        <SearchInput defaultSearchColumn={column} defaultSearchText={text} />
        <Button asChild>
          <Link href="/new">新しいプロジェクト</Link>
        </Button>
      </Flex>
      <ProjectTable projects={projects.projects} />
      <HStack justify="center" pt={8}>
        <PaginationButton
          direction="prev"
          page={page}
          searchColumn={column}
          searchText={text}
          hasNext={projects.hasNext}
        >
          前のページ
        </PaginationButton>
        <PaginationButton
          direction="next"
          page={page}
          searchColumn={column}
          searchText={text}
          hasNext={projects.hasNext}
        >
          次のページ
        </PaginationButton>
      </HStack>
    </Container>
  );
}

type PaginationButtonProps = {
  direction: "prev" | "next";
  page: number;
  searchColumn?: string;
  searchText?: string;
  hasNext: boolean;
  children: React.ReactNode;
};

function PaginationButton({
  direction,
  page,
  searchText,
  searchColumn,
  hasNext,
  children,
}: PaginationButtonProps) {
  const disabled = direction === "prev" ? page === 1 : !hasNext;
  const href =
    direction === "prev"
      ? renderSearchParams({ page: page - 1, text: searchText, column: searchColumn })
      : renderSearchParams({ page: page + 1, text: searchText, column: searchColumn });
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
