import { createClient } from "@/lib/api";
import { UiModeProvider } from "@/contexts/ui-mode-context";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { BottomNavigation } from "./_components/bottom-navigation";
import { GlobalHeader } from "./_components/global-header";
import { Header } from "./_components/header";
import Sidebar from "./_components/sidebar";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // プロジェクト情報を取得してSEOアドオンの有効状態を確認
  const client = createClient();
  const projectRes = await client.project.$get(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  let seoAddonEnabled = false;
  if (projectRes.ok) {
    const project = await projectRes.json();
    seoAddonEnabled = project.seoAddonEnabled ?? false;
  }

  return (
    <UiModeProvider>
      <Header seoAddonEnabled={seoAddonEnabled} />
      <GlobalHeader />
      <div
        className={css({
          mx: "auto",
          px: { base: 2, md: 0 },
          display: "flex",
          flexDirection: { base: "column", md: "row" },
          pt: { base: 28, md: 16 }, // モバイル: header + global-header分、PC: global-headerのみ
        })}
      >
        <Box flexGrow="1" flexShrink="0">
          <Sidebar seoAddonEnabled={seoAddonEnabled} />
        </Box>
        <main
          className={css({
            mt: { base: 0, md: 12 },
            mb: { base: 20, md: 12 },
            px: 4,
            w: "full",
            minW: 0,
          })}
        >
          {children}
        </main>
      </div>
      <BottomNavigation />
    </UiModeProvider>
  );
}
