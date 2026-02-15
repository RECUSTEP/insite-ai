import { VStack } from "styled-system/jsx";
import DesktopDrawer from "./desktop-drawer";
import { Logout } from "./logout";
import { Navigation } from "./navigation";
import { ProjectOverview } from "./project-overview";

interface SidebarProps {
  seoAddonEnabled: boolean;
}

export default function Sidebar({ seoAddonEnabled }: SidebarProps) {
  return (
    <DesktopDrawer>
      <Navigation seoAddonEnabled={seoAddonEnabled} />
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
