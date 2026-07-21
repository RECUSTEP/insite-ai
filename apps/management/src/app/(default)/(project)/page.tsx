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
  let globalMetaInsightEnabled: boolean | null = null;

  try {
    const client = createClient();
    const requestOptions = {
      headers: {
        cookie: cookies().toString(),
      },
    };
    const [response, applicationSettingsResponse] = await Promise.all([
      client.admin.auth["with-projects"].$get(
        {
          query: {
            offset: `${(page - 1) * PAGE_SIZE}`,
            limit: `${PAGE_SIZE}`,
            searchText: text,
          },
        },
        requestOptions,
      ),
      client.admin["application-settings"].$get({}, requestOptions),
    ]);

    if (response.status === 401 || applicationSettingsResponse.status === 401) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }

    if (response.ok) {
      const json = await response.json();
      authWithProjects = (json.authWithProjects ?? []) as AuthWithProjects[];
      hasNext = json.hasNext ?? false;
    } else {
      console.error("[Home] API error:", response.status, await response.text());
      fetchError = true;
    }

    if (applicationSettingsResponse.ok) {
      const applicationSettings = await applicationSettingsResponse.json();
      globalMetaInsightEnabled = applicationSettings.metaInsightEnabled === "true";
    } else {
      console.error("[Home] Application settings API error:", applicationSettingsResponse.status);
    }
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    console.error("[Home] fetch error:", e);
    fetchError = true;
  }

  return (
    <Container py={6} w="full" maxW="full">
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

      {globalMetaInsightEnabled === false && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "0.5rem",
            color: "#92400e",
            fontSize: "0.875rem",
          }}
        >
          Metaの全体設定がOFFです。プロジェクトをONにしてもユーザー画面では利用できません。{" "}
          <Link
            href="/application-setting"
            style={{ fontWeight: 600, textDecoration: "underline" }}
          >
            アプリケーション設定を確認
          </Link>
        </div>
      )}

      {/* ツリービュー */}
      <AuthProjectTree
        authWithProjects={authWithProjects}
        globalMetaInsightEnabled={globalMetaInsightEnabled}
      />

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

function PaginationButton({
  direction,
  page,
  searchText,
  hasNext,
  children,
}: PaginationButtonProps) {
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
