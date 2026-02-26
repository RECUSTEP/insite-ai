import { createClient } from "@/lib/api";
import { UiModeProvider } from "@/contexts/ui-mode-context";
import { cookies } from "next/headers";
import { css } from "styled-system/css";
import { DockNavigation } from "./_components/dock-navigation";
import { GlobalHeader } from "./_components/global-header";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <GlobalHeader />
      <main
        className={css({
          maxW: "6xl",
          mx: "auto",
          px: 4,
          pt: 20,
          pb: 32,
          w: "full",
          minW: 0,
        })}
      >
        {children}
      </main>
      <DockNavigation seoAddonEnabled={seoAddonEnabled} />
    </UiModeProvider>
  );
}
