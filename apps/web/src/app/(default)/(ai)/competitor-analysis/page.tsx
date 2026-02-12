import { Text } from "@/components/ui/text";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Flex, HStack } from "styled-system/jsx";
import { HelpPopover } from "../_components/help-popover";
import type { TabPanelProps } from "../_components/tab-panel";
import { CompetitorAnalysisForm } from "./_components/competitor-analysis-form";
import { MarketAnalysisForm } from "./_components/market-analysis-form";
import { AccountAnalysisForm } from "./_components/account-analysis-form";
import { InsightAnalysisForm } from "./_components/insight-analysis-form";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { ProjectSelector } from "../../_components/project-selector";

export const metadata: Metadata = {
  title: "分析AI",
};

const TabPanel = dynamic(() => import("../_components/tab-panel").then((mod) => mod.TabPanel), {
  ssr: false,
});

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

  const tabs = [
    { label: "市場分析", id: "market", content: <MarketAnalysisForm /> },
    { label: "競合分析", id: "competitor", content: <CompetitorAnalysisForm /> },
    { label: "自社アカウント分析", id: "account", content: <AccountAnalysisForm /> },
    { label: "インサイト分析", id: "insight", content: <InsightAnalysisForm /> },
  ] as TabPanelProps["panels"];

  return (
    <Flex gap={8} direction="column">
      <HStack>
        <Text as="h1" size="xl">
          分析AI
        </Text>
        <HelpPopover
          contents={[
            {
              title: "市場分析",
              id: "market",
            },
            {
              title: "競合分析",
              id: "competitor",
            },
            {
              title: "自社アカウント分析",
              id: "account",
            },
            {
              title: "インサイト分析",
              id: "insight",
            },
          ]}
        />
      </HStack>
      <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
      <TabPanel panels={tabs} />
    </Flex>
  );
}
