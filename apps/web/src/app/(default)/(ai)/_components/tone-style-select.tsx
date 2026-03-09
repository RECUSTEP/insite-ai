"use client";

import { Select } from "@/components/ui/select";
import { Portal } from "@ark-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { css } from "styled-system/css";

export const TONE_STYLE_OPTIONS = [
  { label: "少し堅苦しい真面目", value: "formal-serious" },
  { label: "ポップ", value: "pop" },
  { label: "スタンダード", value: "standard" },
  { label: "厳しめ", value: "strict" },
  { label: "優しい", value: "gentle" },
] as const;

export type ToneStyleValue = (typeof TONE_STYLE_OPTIONS)[number]["value"];

type Props = {
  /** Controlled mode: use with ConsultChat */
  value?: ToneStyleValue;
  onChange?: (value: ToneStyleValue) => void;
  /** Uncontrolled mode: use with Form (default) */
  name?: string;
  defaultValue?: ToneStyleValue;
};

export function ToneStyleSelect(props: Props) {
  const isControlled = props.value !== undefined;
  const defaultValue = props.defaultValue ?? "standard";

  return (
    <Select.Root
      items={[...TONE_STYLE_OPTIONS]}
      name={props.name ?? "toneStyle"}
      value={isControlled ? [props.value!] : undefined}
      defaultValue={isControlled ? undefined : [defaultValue]}
      onValueChange={(e) => {
        const v = e.value[0] as ToneStyleValue | undefined;
        if (v) props.onChange?.(v);
      }}
    >
      <Select.Label className={css({ srOnly: !isControlled })}>出力のトーン</Select.Label>
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
              <Select.ItemGroupLabel>出力のトーン</Select.ItemGroupLabel>
              {TONE_STYLE_OPTIONS.map((item) => (
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
}
