import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Flex, HStack } from "styled-system/jsx";
import { ProjectSelector } from "../../_components/project-selector";
import { HelpPopover, type Props as HelpPopoverProps } from "../_components/help-popover";
import { PageHistory } from "../_components/page-history";
import type { TabPanelProps } from "../_components/tab-panel";
import { AccountAnalysisForm } from "./_components/account-analysis-form";
import { CompetitorAnalysisForm } from "./_components/competitor-analysis-form";
import { CompetitorAnalysisWrapper } from "./_components/competitor-analysis-wrapper";
import { InsightAnalysisForm } from "./_components/insight-analysis-form";
import { MarketAnalysisForm } from "./_components/market-analysis-form";
import { MetaInsightPanel } from "./_components/meta-insight-panel";

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
  let metaSocialChatEnabled = false;
  let metaAccountLinkEnabled = false;
  if (projectRes.ok && projectsRes.ok) {
    const projectJson = await projectRes.json();
    currentProjectId = projectJson.projectId;
    metaSocialChatEnabled = projectJson.metaSocialChatEnabled ?? false;
    metaAccountLinkEnabled = projectJson.metaAccountLinkEnabled ?? false;
    projects = await projectsRes.json();
  }

  const baseTabs = [
    { label: "市場分析", id: "market", content: <MarketAnalysisForm /> },
    { label: "競合分析", id: "competitor", content: <CompetitorAnalysisForm /> },
    { label: "自社アカウント分析", id: "account", content: <AccountAnalysisForm /> },
    { label: "インサイト分析", id: "insight", content: <InsightAnalysisForm /> },
  ] as TabPanelProps["panels"];

  // NOTE: API 未接続のため、タブはフラグによらず常時表示（UI プレビュー用）
  const metaTab = [
    {
      label: "Meta インサイト",
      id: "meta-insight",
      content: (
        <MetaInsightPanel
          metaSocialChatEnabled={metaSocialChatEnabled}
          metaAccountLinkEnabled={metaAccountLinkEnabled}
        />
      ),
    },
  ] as TabPanelProps["panels"];

  const tabs = [...baseTabs, ...metaTab] as TabPanelProps["panels"];

  const helpPopoverContents: HelpPopoverProps["contents"] = [
    { title: "市場分析", id: "market" },
    { title: "競合分析", id: "competitor" },
    { title: "自社アカウント分析", id: "account" },
    { title: "インサイト分析", id: "insight" },
  ];
  helpPopoverContents.push({
    title: "Meta インサイト（Instagram・Threads）",
    id: "meta-insight",
  });

  return (
    <CompetitorAnalysisWrapper>
      <Flex
        gap={8}
        direction={{ base: "column", xl: "row" }}
        align={{ xl: "flex-start" }}
        className={css({
          animation: "fadeIn 0.4s ease",
        })}
      >
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
              分析AI
            </Text>
            <HelpPopover contents={helpPopoverContents} />
          </HStack>
          <ProjectSelector projects={projects} selectedProjectId={currentProjectId} />
          <TabPanel panels={tabs} />
        </Flex>
        <PageHistory aiTypes={["market", "competitor", "account", "insight"]} />
      </Flex>
    </CompetitorAnalysisWrapper>
  );
}
