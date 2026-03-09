import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container, Grid, VStack } from "styled-system/jsx";
import { DashboardChart } from "./_components/dashboard-chart";
import { StatCard } from "./_components/stat-card";
import { UsageByFeatureChart } from "./_components/usage-by-feature-chart";

export default async function DashboardPage() {
  let data: {
    dailyUsage?: unknown[];
    totalProjects?: number;
    totalAuth?: number;
    monthlyUsage?: number;
    usageByFeature?: unknown[];
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
      <Container py={10} maxW="6xl">
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
  const monthlyUsage = Number(data.monthlyUsage) || 0;
  const usageByFeature = (Array.isArray(data.usageByFeature) ? data.usageByFeature : []) as {
    feature: string;
    count: number;
  }[];

  return (
    <Container py={10} maxW="6xl">
      <VStack gap={8} alignItems="stretch">
        <Text as="h1" size="xl">
          ダッシュボード
        </Text>

        <Grid
          columns={{ base: 1, sm: 2, lg: 4 }}
          gap={4}
          w="full"
        >
          <StatCard label="総プロジェクト数" value={totalProjects} />
          <StatCard label="総アカウント数" value={totalAuth} />
          <StatCard label="今月のAPI使用量" value={monthlyUsage} />
        </Grid>

        <VStack gap={2} alignItems="stretch">
          <Text as="h2" size="lg">
            直近30日間のAPI使用量
          </Text>
          <DashboardChart data={dailyUsage} />
        </VStack>

        <VStack gap={2} alignItems="stretch">
          <Text as="h2" size="lg">
            今月の機能別API使用量
          </Text>
          <UsageByFeatureChart data={usageByFeature ?? []} />
        </VStack>
      </VStack>
    </Container>
  );
}
