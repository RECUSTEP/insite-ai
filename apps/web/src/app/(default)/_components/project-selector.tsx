"use client";

import { Select } from "@/components/ui/select";
import { Portal } from "@ark-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  selectedProjectId: string;
  projects: {
    projectId: string;
    name: string;
  }[];
  onChange?: (value: string) => void;
  onStarted?: () => void;
  onCompleted?: () => void;
};

export const ProjectSelector = (props: Props) => {
  const router = useRouter();
  const found = props.projects.find((item) => item.projectId === props.selectedProjectId);

  const updateSession = async (projectId: string) => {
    try {
      await fetch("/api/session", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ projectId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const items = props.projects.map((p) => ({ label: p.name, value: p.projectId }));

  return (
    <Select.Root
      items={items}
      value={[found?.projectId ?? ""]}
      onValueChange={(e) => {
        const value = e.value[0] ?? "";
        if (props.onStarted) props.onStarted;
        updateSession(value)
          .then(() => {
            if (props.onChange) props.onChange(value);
          })
          .finally(() => {
            if (props.onCompleted) props.onCompleted();
            router.refresh();
          });
      }}
    >
      <Select.Label>プロジェクト選択</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
          <Select.Indicator>
            <ChevronDownIcon />
          </Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            <Select.ItemGroup>
              <Select.ItemGroupLabel>プロジェクト選択</Select.ItemGroupLabel>
              {items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.ItemGroup>
          </Select.Content>
        </Select.Positioner>
      </Portal>
      <Select.HiddenSelect />
    </Select.Root>
  );
};
