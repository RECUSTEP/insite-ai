"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HStack } from "styled-system/jsx";
import { renderSearchParams } from "./searchParams";

type Props = {
  defaultSearchText?: string;
};

export const SearchInput = ({ defaultSearchText }: Props) => {
  const router = useRouter();
  const [text, setText] = useState(defaultSearchText ?? "");

  const handleSearch = () => {
    router.push(renderSearchParams({ page: 1, text }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <HStack alignItems="center" gap={2}>
      <Input
        placeholder="アカウントID / プロジェクトID / 担当者 / オーナー / プロジェクト名で検索..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        minW="320px"
      />
      <Button onClick={handleSearch} variant="outline" size="sm">
        <SearchIcon size={16} />
        検索
      </Button>
    </HStack>
  );
};
