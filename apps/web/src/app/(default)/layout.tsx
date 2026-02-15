import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { BottomNavigation } from "./_components/bottom-navigation";
import { Header } from "./_components/header";
import Sidebar from "./_components/sidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div
        className={css({
          mx: "auto",
          px: { base: 2, md: 0 },
          display: "flex",
          flexDirection: { base: "column", md: "row" },
        })}
      >
        <Header />
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
    </>
  );
}
