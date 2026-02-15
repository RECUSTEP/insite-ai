import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Flex, HStack } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { HelpPopover } from "../_components/help-popover";
import type { TabPanelProps } from "../_components/tab-panel";
import { ImageForm } from "./_components/image-form";
import { NoImageForm } from "./_components/no-image-form";

export const metadata: Metadata = {
  title: "ライティングAI（Google Map）",
};

async function fetchInstructionGuide() {
  const client = createClient();
  const response = await client["instruction-guide"].$post(
    {
      json: {
        formNames: ["google-map", "google-map-no-image"],
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

const TabPanel = dynamic(() => import("../_components/tab-panel").then((mod) => mod.TabPanel), {
  ssr: false,
});

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
      id: "image",
      content: <ImageForm placeholder={instructionGuides["google-map"]} />,
    },
    {
      label: "画像なし",
      id: "no-image",
      content: <NoImageForm placeholder={instructionGuides["google-map-no-image"]} />,
    },
  ] satisfies TabPanelProps["panels"];

  return (
    <Flex
      gap={8}
      direction="column"
      className={css({
        animation: "fadeIn 0.4s ease",
      })}
    >
      <HStack>
        <Text
          as="h1"
          size="xl"
          className={css({
            fontWeight: 600,
            color: "text.primary",
          })}
        >
          ライティングAI（Google Map）
        </Text>
        <HelpPopover
          contents={[
            {
              title: "画像あり",
              id: "google-map",
            },
            {
              title: "画像なし",
              id: "google-map-no-image",
            },
          ]}
        />
      </HStack>
      <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
      <TabPanel panels={tabs} />
    </Flex>
  );
}
