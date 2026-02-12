import { css } from "styled-system/css";
import { VStack } from "styled-system/jsx";
import { Logout } from "./logout";
import { MobileDrawer } from "./mobile-drawer";
import { Navigation } from "./navigation";
import { ProjectOverview } from "./project-overview";

export function Header() {
  return (
    <header
      className={css({
        display: { base: "flex", md: "none" },
        py: 2,
      })}
    >
      <MobileDrawer>
        <Navigation />
        <VStack px={4} alignItems="stretch">
          <ProjectOverview />
          <Logout />
        </VStack>
      </MobileDrawer>
    </header>
  );
}
