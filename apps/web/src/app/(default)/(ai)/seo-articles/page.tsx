import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { ShieldAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Box, Flex, VStack } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { SeoArticleForm } from "./_components/seo-article-form";
import { SeoArticlesWrapper } from "./_components/seo-articles-wrapper";

export const metadata: Metadata = {
  title: "SEO・AIO記事",
};

export default async function Page() {
  const client = createClient();
  const projectRes = await client.project.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );
  const projectsRes = await client.projects.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (
    !projectRes.ok &&
    projectRes.status !== 404 &&
    !projectsRes.ok &&
    projectsRes.status !== 404
  ) {
    throw new Error("Failed to fetch project info");
  }

  let currentProjectId = "";
  let projects: { projectId: string; name: string }[] = [];
  let seoAddonEnabled = false;
  
  if (projectRes.ok && projectsRes.ok) {
    const project = await projectRes.json();
    currentProjectId = project.projectId;
    seoAddonEnabled = project.seoAddonEnabled ?? false;
    projects = await projectsRes.json();
  }

  // SEOアドオンが無効な場合はアクセス制限メッセージを表示
  if (!seoAddonEnabled) {
    return (
      <SeoArticlesWrapper>
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="calc(100vh - 300px)"
          gap={6}
          px={4}
        >
          <Box
            className={css({
              w: 20,
              h: 20,
              borderRadius: "full",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "orange.100",
            })}
          >
            <ShieldAlertIcon
              size={48}
              className={css({
                color: "orange.500",
              })}
            />
          </Box>
          <VStack gap={2} textAlign="center" maxW="md">
            <Text
              size="2xl"
              className={css({
                fontWeight: 700,
                color: "text.primary",
              })}
            >
              この機能は有効化されていません
            </Text>
            <Text
              className={css({
                color: "text.secondary",
                fontSize: "md",
                lineHeight: 1.6,
              })}
            >
              SEO/AIO記事生成機能は有料アドオンです。
              <br />
              ご利用をご希望の場合は、管理者にお問い合わせください。
            </Text>
          </VStack>
        </Flex>
      </SeoArticlesWrapper>
    );
  }

  return (
    <SeoArticlesWrapper>
      <Flex
        gap={8}
        direction="column"
        className={css({
          animation: "fadeIn 0.4s ease",
        })}
      >
        <Text
          as="h1"
          size="xl"
          className={css({
            fontWeight: 600,
            color: "text.primary",
          })}
        >
          SEO・AIO記事
        </Text>
        <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
        <SeoArticleForm />
      </Flex>
    </SeoArticlesWrapper>
  );
}
