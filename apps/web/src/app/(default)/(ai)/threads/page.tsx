import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Box, Flex, HStack } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { HelpPopover } from "../_components/help-popover";
import { PageHistory } from "../_components/page-history";
import type { TabPanelProps } from "../_components/tab-panel";
import { ThreadsForm } from "./_components/threads-form";
import { ThreadsNoImageForm } from "./_components/threads-no-image-form";

export const metadata: Metadata = {
  title: "ライティングAI（Threads）",
};

const TabPanel = dynamic(() => import("../_components/tab-panel").then((mod) => mod.TabPanel), {
  ssr: false,
});

async function fetchInstructionGuide() {
  const client = createClient();
  const response = await client["instruction-guide"].$post(
    {
      json: {
        formNames: ["threads", "threads-no-image"],
      },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    console.log(response.status);
    throw new Error("Failed to fetch instruction guide");
  }

  return await response.json();
}

export default async function Page() {
  const instructionGuides = await fetchInstructionGuide();
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

  const tabs = [
    {
      label: "画像あり",
      id: "threads",
      content: <ThreadsForm placeholder={instructionGuides["threads"]} />,
    },
    {
      label: "テキストのみ",
      id: "threads-no-image",
      content: <ThreadsNoImageForm placeholder={instructionGuides["threads-no-image"]} />,
    },
  ] satisfies TabPanelProps["panels"];

  return (
    <Flex
      gap={8}
      direction={{ base: "column", xl: "row" }}
      align={{ xl: "flex-start" }}
      className={css({
        animation: "fadeIn 0.4s ease",
      })}
    >
      <Box display={{ base: "none", xl: "block" }} w="300px" flexShrink={0} />
      <Flex direction="column" gap={8} flex="1" minW={0}>
        <HStack>
          <Text
            as="h1"
            size="xl"
            className={css({
              fontWeight: 600,
              color: "text.primary",
            })}
          >
            ライティングAI（Threads）
          </Text>
          <HelpPopover
            contents={[
              {
                title: "画像あり",
                id: "threads",
              },
              {
                title: "テキストのみ",
                id: "threads-no-image",
              },
            ]}
          />
        </HStack>
        <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
        <TabPanel panels={tabs} />
      </Flex>
      <PageHistory aiTypes={["threads", "threads-no-image"]} />
    </Flex>
  );
}
