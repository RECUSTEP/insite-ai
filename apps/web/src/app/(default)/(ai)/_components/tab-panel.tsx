import { Tabs } from "@/components/ui/tabs";

export type TabPanelProps = {
  panels: { label: string; id: string; content: React.ReactNode }[];
};

export function TabPanel({ panels }: TabPanelProps) {
  if (panels.length === 0) {
    return null;
  }

  return (
    // biome-ignore lint/style/noNonNullAssertion:
    <Tabs.Root defaultValue={panels[0]!.id} lazyMount>
      <Tabs.List mb={4}>
        {panels.map((option) => (
          <Tabs.Trigger
            key={option.id}
            value={option.id}
            color="subfont"
            _selected={{
              color: "font",
            }}
          >
            {option.label}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator />
      </Tabs.List>
      {panels.map((panel) => (
        <Tabs.Content key={panel.id} value={panel.id}>
          {panel.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
