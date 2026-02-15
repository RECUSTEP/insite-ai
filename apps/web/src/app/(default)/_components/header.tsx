import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";
import { Logout } from "./logout";
import { MobileDrawer } from "./mobile-drawer";
import { Navigation } from "./navigation";
import { ProjectOverview } from "./project-overview";

interface HeaderProps {
  seoAddonEnabled: boolean;
}

export function Header({ seoAddonEnabled }: HeaderProps) {
  return (
    <header
      className={css({
        display: { base: "flex", md: "none" },
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        bg: "bg.card",
        borderBottom: "1px solid",
        borderColor: "gray.200",
        py: 2,
        px: 4,
        justifyContent: "space-between",
        alignItems: "center",
      })}
    >
      <MobileDrawer>
        <Navigation seoAddonEnabled={seoAddonEnabled} />
        <VStack px={4} alignItems="stretch">
          <ProjectOverview />
          <Logout />
        </VStack>
      </MobileDrawer>
    </header>
  );
}
