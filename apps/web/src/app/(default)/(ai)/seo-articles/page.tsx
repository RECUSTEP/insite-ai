import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Flex } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { SeoArticleForm } from "./_components/seo-article-form";

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
  if (projectRes.ok && projectsRes.ok) {
    currentProjectId = (await projectRes.json()).projectId;
    projects = await projectsRes.json();
  }

  return (
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
  );
}
