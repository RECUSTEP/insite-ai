import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/api";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, UserPlusIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Container, Flex, HStack } from "styled-system/jsx";
import type { AuthWithProjects } from "./_components/auth-project-tree";
import { AuthProjectTree } from "./_components/auth-project-tree";
import { SearchInput } from "./_components/search-input";
import { renderSearchParams, searchParamsSchema } from "./_components/searchParams";

const PAGE_SIZE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { page, text } = searchParamsSchema.parse(searchParams);

  let authWithProjects: AuthWithProjects[] = [];
  let hasNext = false;
  let fetchError = false;

  try {
    const client = createClient();
    const response = await client.admin.auth["with-projects"].$get(
      {
        query: {
          offset: `${(page - 1) * PAGE_SIZE}`,
          limit: `${PAGE_SIZE}`,
          searchText: text,
        },
      },
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (response.status === 401) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }

    if (!response.ok) {
      console.error("[Home] API error:", response.status, await response.text());
      fetchError = true;
    } else {
      const json = await response.json();
      authWithProjects = (json.authWithProjects ?? []) as AuthWithProjects[];
      hasNext = json.hasNext ?? false;
    }
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    console.error("[Home] fetch error:", e);
    fetchError = true;
  }

  return (
    <Container py={10} maxW="6xl">
      {fetchError && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
            color: "#991b1b",
            fontSize: "0.875rem",
          }}
        >
          データの取得に失敗しました。ページを再読み込みしてください。
        </div>
      )}
      {/* ヘッダー: 検索 + ボタン */}
      <Flex mb={6} justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <SearchInput defaultSearchText={text} />
        <HStack gap={2}>
          <Button asChild variant="outline" size="sm">
            <Link href="/new-auth">
              <UserPlusIcon size={14} />
              アカウント追加
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/new">
              <PlusIcon size={14} />
              プロジェクト追加
            </Link>
          </Button>
        </HStack>
      </Flex>

      {/* ツリービュー */}
      <AuthProjectTree authWithProjects={authWithProjects} />

      {/* ページネーション */}
      <HStack justify="center" pt={8}>
        <PaginationButton direction="prev" page={page} searchText={text} hasNext={hasNext}>
          前のページ
        </PaginationButton>
        <PaginationButton direction="next" page={page} searchText={text} hasNext={hasNext}>
          次のページ
        </PaginationButton>
      </HStack>
    </Container>
  );
}

type PaginationButtonProps = {
  direction: "prev" | "next";
  page: number;
  searchText?: string;
  hasNext: boolean;
  children: React.ReactNode;
};

function PaginationButton({ direction, page, searchText, hasNext, children }: PaginationButtonProps) {
  const disabled = direction === "prev" ? page === 1 : !hasNext;
  const href =
    direction === "prev"
      ? renderSearchParams({ page: page - 1, text: searchText })
      : renderSearchParams({ page: page + 1, text: searchText });

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
