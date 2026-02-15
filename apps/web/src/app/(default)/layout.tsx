import { UiModeProvider } from "@/contexts/ui-mode-context";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { BottomNavigation } from "./_components/bottom-navigation";
import { GlobalHeader } from "./_components/global-header";
import { Header } from "./_components/header";
import Sidebar from "./_components/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UiModeProvider>
      <Header />
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
          <Sidebar />
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
