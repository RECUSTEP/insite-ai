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
import { FeedPostForm } from "./_components/feed-post-form";
import { ProfileForm } from "./_components/profile";
import { ReelAndStoriesForm } from "./_components/reel-and-stories";

export const metadata: Metadata = {
  title: "ライティングAI（Instagram）",
};

const TabPanel = dynamic(() => import("../_components/tab-panel").then((mod) => mod.TabPanel), {
  ssr: false,
});

async function fetchInstructionGuide() {
  const client = createClient();
  const response = await client["instruction-guide"].$post(
    {
      json: {
        formNames: ["feed-post", "reel-and-stories", "profile"],
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
      label: "フィード投稿",
      id: "feed-post",
      content: <FeedPostForm placeholder={instructionGuides["feed-post"]} />,
    },
    {
      label: "リール",
      id: "reel-and-stories",
      content: <ReelAndStoriesForm placeholder={instructionGuides["reel-and-stories"]} />,
    },
    {
      label: "プロフィール",
      id: "profile",
      content: <ProfileForm placeholder={instructionGuides["profile"]} />,
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
          ライティングAI（Instagram）
        </Text>
        <HelpPopover
          contents={[
            {
              title: "フィード投稿",
              id: "feed-post",
            },
            {
              title: "リール",
              id: "reel-and-stories",
            },
            {
              title: "プロフィール",
              id: "profile",
            },
          ]}
        />
      </HStack>
      <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
      <TabPanel panels={tabs} />
    </Flex>
  );
}
