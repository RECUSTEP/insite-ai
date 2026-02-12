import { VStack } from "styled-system/jsx";
import DesktopDrawer from "./desktop-drawer";
import { Logout } from "./logout";
import { Navigation } from "./navigation";
import { ProjectOverview } from "./project-overview";

export default function Sidebar() {
  return (
    <DesktopDrawer>
      <Navigation />
      <VStack
        px={4}
        alignItems="stretch"
        css={{
          ".group[data-expanded=false] &": {
            display: "none",
          },
        }}
      >
        <ProjectOverview />
        <Logout />
      </VStack>
    </DesktopDrawer>
  );
}
