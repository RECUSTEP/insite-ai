import { Text } from "@/components/ui/text";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { Container, Grid, VStack } from "styled-system/jsx";
import { DashboardChart } from "./_components/dashboard-chart";
import { StatCard } from "./_components/stat-card";

export default async function DashboardPage() {
  const client = createClient();
  const response = await client.admin["dashboard-stats"].$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  const { dailyUsage, totalProjects, totalAuth, monthlyUsage } = await response.json();

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
      </VStack>
    </Container>
  );
}
