"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Portal } from "@ark-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { HStack } from "styled-system/jsx";
import { renderSearchParams } from "./searchParams";

type ColumnValue = "projectName" | "ownerName";

const isColumnValue = (v: unknown): v is ColumnValue => {
  const _v = v as ColumnValue;
  return _v === "projectName" || _v === "ownerName";
};

const searchableColumns: { label: string; value: ColumnValue }[] = [
  { label: "プロジェクト名", value: "projectName" },
  { label: "オーナー名", value: "ownerName" },
];

type Props = {
  defaultSearchText?: string;
  defaultSearchColumn?: string;
};

export const SearchInput = ({ defaultSearchColumn, defaultSearchText }: Props) => {
  const [column, setColumn] = useState<ColumnValue>(
    isColumnValue(defaultSearchColumn) ? defaultSearchColumn : "projectName",
  );
  const [text, setText] = useState(defaultSearchText ?? "");
  const searchParams = renderSearchParams({
    page: 1,
    text,
    column,
  });

  return (
    <HStack alignItems="end">
      <Select.Root
        items={searchableColumns}
        value={[column]}
        onValueChange={(e) => {
          const value = e.value[0];
          if (value) {
            setColumn(value as ColumnValue);
          }
        }}
      >
        <Select.Label>検索タイプ</Select.Label>
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
                {searchableColumns.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator> ✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Portal>
        <Select.HiddenSelect />
      </Select.Root>
      <Input
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <Link href={searchParams}>
        <Button>検索</Button>
      </Link>
    </HStack>
  );
};
