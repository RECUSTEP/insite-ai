import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Flex } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { PageHistory } from "../_components/page-history";
import { ConsultChat } from "./_components/consult-chat";

export const metadata: Metadata = {
  title: "AI店舗運営",
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
      direction={{ base: "column", xl: "row" }}
      align={{ xl: "flex-start" }}
      className={css({ animation: "fadeIn 0.4s ease" })}
    >
      <Flex direction="column" gap={4} flex="1" minW={0}>
        <Flex justify="space-between" align="center">
          <Text
            as="h1"
            size="xl"
            className={css({ fontWeight: 600, color: "text.primary" })}
          >
            AI店舗運営
          </Text>
        </Flex>
        <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
        <ConsultChat projectId={currentProjectId} />
      </Flex>
      <PageHistory aiTypes={["improvement", "improvement-no-image"]} />
    </Flex>
  );
}
