import { Text } from "@/components/ui/text";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Flex, HStack } from "styled-system/jsx";
import { HelpPopover } from "../_components/help-popover";
import type { TabPanelProps } from "../_components/tab-panel";
import { ImageForm } from "./_components/image-form";
import { NoImageForm } from "./_components/no-image-form";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { ProjectSelector } from "../../_components/project-selector";

export const metadata: Metadata = {
  title: "AI店舗運営",
};

const TabPanel = dynamic(() => import("../_components/tab-panel").then((mod) => mod.TabPanel), {
  ssr: false,
});

async function fetchInstructionGuide() {
  const client = createClient();
  const response = await client["instruction-guide"].$post(
    {
      json: {
        formNames: ["improvement", "improvement-no-image"],
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
      label: "AIコンサルタント",
      id: "image",
      content: <ImageForm placeholder={instructionGuides["improvement"]} />,
    },
    {
      label: "AI相談",
      id: "no-image",
      content: <NoImageForm placeholder={instructionGuides["improvement-no-image"]} />,
    },
  ] satisfies TabPanelProps["panels"];

  return (
    <Flex gap={8} direction="column">
      <HStack>
        <Text as="h1" size="xl">
          AI店舗運営
        </Text>
        <HelpPopover
          contents={[
            {
              title: "AIコンサルタント",
              id: "improvement",
            },
            {
              title: "AI相談",
              id: "improvement-no-image",
            },
          ]}
        />
      </HStack>
      <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
      <TabPanel panels={tabs} />
    </Flex>
  );
}
