"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Text, type TextProps } from "@/components/ui/text";
import { Select as UnstyledSelect } from "@ark-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  Column,
  ColumnFiltersState,
  HeaderGroup,
  PaginationState,
} from "@tanstack/react-table";
import type { analysisHistorySchema } from "api/schema";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ExternalLinkIcon,
  FilterIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { css } from "styled-system/css";
import { Box, HStack } from "styled-system/jsx";
import type { z } from "zod";

const aiTypeToValueMap = {
  market: "competitor",
  competitor: "competitor",
  account: "competitor",
  insight: "competitor",
  improvement: "improvement",
  "improvement-no-image": "improvement",
  writing: "writing",
  "writing-no-image": "writing",
  "feed-post": "writing",
  "reel-and-stories": "writing",
  profile: "writing",
  "google-map": "google-map",
  "google-map-no-image": "google-map",
  "seo-article": "seo-article",
} as const;

const aiTypeMap = {
  competitor: "分析AI",
  improvement: "AI店舗運営",
  writing: "ライティングAI（Instagram）",
  "google-map": "ライティングAI（Google Map）",
  "seo-article": "SEO・AIO記事",
} as const;

type RawHistory = z.infer<typeof analysisHistorySchema>;

type History = Omit<z.infer<typeof analysisHistorySchema>, "aiType"> & {
  aiType: keyof typeof aiTypeMap;
};

const columnHelper = createColumnHelper<History>();

const columns = [
  columnHelper.accessor("aiType", {
    header: "AIの種類",
    cell: (info) => (
      <Text as="span" w="fit-content" display="block" mx="auto">
        {aiTypeMap[info.getValue()]}
      </Text>
    ),
    meta: {
      filterVariant: "select",
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "ご利用日",
    cell: (info) =>
      new Date(info.getValue()).toLocaleString("ja", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
  }),
  columnHelper.accessor((row) => `${row.input.instruction || ""}${row.input.image || ""}`, {
    id: "input",
    header: "入力情報",
    cell: (info) => (
      <>
        {info.row.original.input.instruction && (
          <EllipsisText my={2} maxW="sm">
            {info.row.original.input.instruction}
          </EllipsisText>
        )}
        {info.row.original.input.image && (
          <img
            src={`/api/image/${info.row.original.input.image}`}
            alt=""
            className={css({
              aspectRatio: "1/1",
              height: 24,
              width: 24,
              objectFit: "scale-down",
              my: 2,
            })}
          />
        )}
      </>
    ),
  }),
  columnHelper.accessor("output.output", {
    header: "出力情報",
    cell: (info) => (
      <EllipsisText my={2} maxW="sm">
        {info.getValue()}
      </EllipsisText>
    ),
  }),
  columnHelper.accessor(() => "actions", {
    id: "actions",
    header: "",
    cell: (info) => (
      <HStack gap={2}>
        <Link href={`/history/${info.row.original.id}`} scroll={false}>
          <ExternalLinkIcon size="18" />
        </Link>
      </HStack>
    ),
  }),
];

export type Props = {
  histories: RawHistory[];
};

export function HistoryTable({ histories: rawHistories }: Props) {
  const histories = useMemo(
    () => rawHistories.map((history) => ({ ...history, aiType: aiTypeToValueMap[history.aiType] })),
    [rawHistories],
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useReactTable({
    data: histories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      columnPinning: {
        right: ["actions"],
      },
    },
    state: {
      columnFilters,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
  });

  return (
    <>
      <Box overflow="auto">
        <Table.Root variant="outline">
          <Header header={table.getHeaderGroups()} />
          <Table.Body whiteSpace="nowrap">
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    data-pin={cell.column.getIsPinned() || undefined}
                    css={{
                      "&[data-pin=right]": {
                        position: "sticky",
                        right: 0,
                        bg: "bg.default",
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
      <Box w="fit-content" ml="auto" mt={2}>
        <Pagination table={table} />
      </Box>
    </>
  );
}

function Header({ header }: { header: HeaderGroup<History>[] }) {
  return (
    <Table.Head>
      {header.map((headerGroup) => (
        <Table.Row key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <Table.Header
              key={header.id}
              data-pin={header.column.getIsPinned() || undefined}
              w="max-content"
              whiteSpace="nowrap"
              css={{
                "&[data-pin=right]": {
                  position: "sticky",
                  right: 0,
                },
              }}
            >
              <HStack>
                {flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanFilter() && <Filter column={header.column} />}
              </HStack>
            </Table.Header>
          ))}
        </Table.Row>
      ))}
    </Table.Head>
  );
}

function EllipsisText({ children, ...props }: TextProps) {
  return (
    <Text
      as="span"
      display="block"
      overflow="hidden"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      {...props}
    >
      {children}
    </Text>
  );
}

function Filter({ column }: { column: Column<History> }) {
  const meta = column.columnDef.meta ?? {};
  const filterVariant = "filterVariant" in meta ? meta.filterVariant : undefined;

  switch (filterVariant) {
    case "select":
      return <AiTypeSelect column={column} />;
    default:
      return null;
  }
}

function AiTypeSelect({ column }: { column: Column<History> }) {
  const items = useMemo(
    () => [
      { label: "全て", value: "" },
      { label: "分析AI", value: "competitor" },
      { label: "AI店舗運営", value: "improvement" },
      { label: "ライティングAI（Instagram）", value: "writing" },
      { label: "ライティングAI（Google Map）", value: "google-map" },
      { label: "SEO・AIO記事", value: "seo-article" },
    ],
    [],
  );

  return (
    <Select.Root
      items={items}
      className={css({ w: "fit-content" })}
      size="sm"
      onValueChange={(e) => column.setFilterValue(e.value[0])}
      value={[String(column.getFilterValue() ?? "")]}
    >
      <UnstyledSelect.Trigger className={css({ cursor: "pointer" })} asChild>
        <FilterIcon size={16} />
      </UnstyledSelect.Trigger>
      <Select.Positioner>
        <Select.Content w="36">
          <Select.ItemGroup>
            {items.map((item) => (
              <Select.Item key={item.value} item={item}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.ItemGroup>
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}

function Pagination({ table }: { table: ReturnType<typeof useReactTable<History>> }) {
  const source = table.getState().pagination.pageIndex + 1;
  const [override, setOverride] = useState<number | null>(1);
  const [edit, setEdit] = useState(false);
  const page = edit ? override : source;

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdit(true);

    const page = /^\d+$/.test(e.target.value) ? Number(e.target.value) : null;
    setOverride(page);
  };

  const handlePageConfirm = () => {
    setEdit(false);
    const page = override ?? 1;
    const fixedPage = Math.min(Math.max(0, page - 1), table.getPageCount() - 1);
    table.setPageIndex(fixedPage);
    setOverride(fixedPage + 1);
  };

  const perPage = useMemo(() => [10, 20, 30, 40, 50], []);

  return (
    <HStack gap={6} fontSize="sm" flexWrap="wrap" justifyContent="flex-end">
      <HStack>
        <Text as="span" whiteSpace="nowrap">
          表示数:{" "}
        </Text>
        <Select.Root
          size="sm"
          positioning={{ sameWidth: true }}
          items={perPage.map((value) => ({ label: value.toString(), value: value.toString() }))}
          onValueChange={(e) => table.setPageSize(Number(e.value[0]))}
          value={[table.getState().pagination.pageSize.toString()]}
        >
          <Select.Control w={16}>
            <Select.Trigger>
              <Select.ValueText>{table.getState().pagination.pageSize}</Select.ValueText>
              <ChevronsUpDownIcon />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              <Select.ItemGroup>
                {perPage.map((value) => (
                  <Select.Item
                    key={value}
                    item={{ label: value.toString(), value: value.toString() }}
                  >
                    <Select.ItemText>{value}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </HStack>
      <HStack>
        <Input
          size="sm"
          w={16}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          min="1"
          max={table.getPageCount()}
          value={page ?? ""}
          onChange={handlePageChange}
          onBlur={handlePageConfirm}
          onKeyDown={(e) => e.key === "Enter" && handlePageConfirm()}
        />
        <Text as="span"> / {table.getPageCount().toLocaleString("ja")}</Text>
      </HStack>
      <HStack>
        <IconButton
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ChevronRightIcon />
        </IconButton>
      </HStack>
    </HStack>
  );
}
