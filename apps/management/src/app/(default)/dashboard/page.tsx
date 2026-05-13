import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Box, Container, Grid, HStack, VStack } from "styled-system/jsx";
import { ActiveAccountsCard } from "./_components/active-accounts-card";
import { DashboardChart } from "./_components/dashboard-chart";
import { DashboardSideNav } from "./_components/dashboard-side-nav";
import { StatCard } from "./_components/stat-card";
import { UsageByAccountTable } from "./_components/usage-by-account-table";
import { UsageByFeatureChart } from "./_components/usage-by-feature-chart";

type UsageByAccountRow = {
  authId: string;
  companyName: string | null;
  totalCount: number;
  projectCount: number;
  apiUsageLimitTotal: number;
};

export default async function DashboardPage() {
  let data: {
    dailyUsage?: unknown[];
    totalProjects?: number;
    totalAuth?: number;
    activeAuth?: number;
    monthlyUsage?: number;
    usageByFeature?: unknown[];
    usageByAccount?: unknown[];
  } | null = null;

  try {
    const client = createClient();
    const response = await client.admin["dashboard-stats"].$get(
      {},
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (response.status === 401) {
      redirect("/login");
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Dashboard] API error:", response.status, errText);
    } else {
      data = await response.json();
    }
  } catch (e) {
    if (e instanceof Error && "digest" in e && e.message === "NEXT_REDIRECT") {
      throw e;
    }
    console.error("[Dashboard] fetch error:", e);
  }

  if (!data) {
    return (
      <Container py={6} w="full" maxW="full">
        <VStack gap={4} alignItems="stretch">
          <Text as="h1" size="xl">
            ダッシュボード
          </Text>
          <div
            style={{
              padding: "1.5rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              color: "#991b1b",
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              データの取得に失敗しました
            </p>
            <p style={{ fontSize: "0.875rem" }}>
              ページを再読み込みするか、しばらく経ってから再度お試しください。
            </p>
          </div>
        </VStack>
      </Container>
    );
  }

  const dailyUsage = (Array.isArray(data.dailyUsage) ? data.dailyUsage : []) as {
    date: string;
    count: number;
  }[];
  const totalProjects = Number(data.totalProjects) || 0;
  const totalAuth = Number(data.totalAuth) || 0;
  const activeAuth = Number(data.activeAuth) || 0;
  const monthlyUsage = Number(data.monthlyUsage) || 0;
  const usageByFeature = (Array.isArray(data.usageByFeature) ? data.usageByFeature : []) as {
    feature: string;
    count: number;
  }[];
  const usageByAccount = (Array.isArray(data.usageByAccount)
    ? data.usageByAccount
    : []) as UsageByAccountRow[];

  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  const activeRatio = totalAuth > 0 ? Math.round((activeAuth / totalAuth) * 1000) / 10 : 0;
  const avgUsagePerActive = activeAuth > 0 ? Math.round(monthlyUsage / activeAuth) : 0;

  return (
    <Container py={6} w="full" maxW="full">
      <Grid
        columns={{ base: 1, lg: 12 }}
        gap={6}
        w="full"
        alignItems="start"
      >
        {/* 左サイドバー: サマリーカード + セクション内ナビ */}
        <Box
          gridColumn={{ base: "auto", lg: "span 4", xl: "span 3" }}
          position={{ base: "static", lg: "sticky" }}
          top={{ base: "auto", lg: "6" }}
        >
          <VStack gap={4} alignItems="stretch">
            <VStack gap={1} alignItems="flex-start">
              <Text as="h1" size="xl">
                ダッシュボード
              </Text>
              <span style={{ fontSize: "0.75rem", color: "#71717A" }}>
                集計対象: {monthLabel}
              </span>
            </VStack>

            <StatCard
              label="今月のAPI使用量"
              value={monthlyUsage}
              tone="blue"
              sub={`${monthLabel} 累計`}
              icon={<IconBolt />}
            />
            <StatCard
              label="アクティブアカウント"
              value={activeAuth}
              tone="emerald"
              sub={`全 ${totalAuth.toLocaleString()} 中 ${activeRatio}%`}
              icon={<IconUsers />}
            />
            <StatCard
              label="総プロジェクト数"
              value={totalProjects}
              tone="violet"
              sub="登録済みプロジェクト"
              icon={<IconFolder />}
            />
            <StatCard
              label="アクティブ平均使用量"
              value={avgUsagePerActive}
              tone="amber"
              sub="稼働中アカウントあたり"
              icon={<IconChart />}
            />

            <DashboardSideNav
              items={[
                { href: "#trend", label: "30日間の推移" },
                { href: "#active", label: "アクティブ率" },
                { href: "#by-account", label: "アカウント別使用量" },
                { href: "#by-feature", label: "機能別使用量" },
              ]}
            />
          </VStack>
        </Box>

        {/* 右メインカラム: チャート・テーブル */}
        <Box
          gridColumn={{ base: "auto", lg: "span 8", xl: "span 9" }}
          minW={0}
        >
          <VStack gap={6} alignItems="stretch">
            <Section id="trend" title="直近30日間のAPI使用量" subtitle="日別の推移">
              <DashboardChart data={dailyUsage} />
            </Section>

            <Section id="active" title="アクティブアカウント率" subtitle="ログイン中セッション基準">
              <ActiveAccountsCard activeAuth={activeAuth} totalAuth={totalAuth} />
            </Section>

            <Section
              id="by-account"
              title="アカウント別 API 使用量"
              subtitle={`${monthLabel} の利用状況（プロジェクト横断で集約）`}
            >
              <UsageByAccountTable data={usageByAccount} />
            </Section>

            <Section id="by-feature" title="今月の機能別API使用量" subtitle="機能ごとの利用回数">
              <UsageByFeatureChart data={usageByFeature ?? []} />
            </Section>
          </VStack>
        </Box>
      </Grid>
    </Container>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <VStack gap={2} alignItems="stretch" id={id} scrollMarginTop="80px">
      <HStack justify="space-between" alignItems="baseline">
        <VStack gap={0.5} alignItems="flex-start">
          <Text as="h2" size="lg">
            {title}
          </Text>
          {subtitle ? (
            <span style={{ fontSize: "0.75rem", color: "#71717A" }}>{subtitle}</span>
          ) : null}
        </VStack>
      </HStack>
      {children}
    </VStack>
  );
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
