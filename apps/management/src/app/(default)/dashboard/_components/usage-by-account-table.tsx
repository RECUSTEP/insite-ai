"use client";

import { useMemo, useState } from "react";
import { css } from "styled-system/css";
import { HStack, VStack } from "styled-system/jsx";

export type UsageByAccountItem = {
  authId: string;
  companyName: string | null;
  totalCount: number;
  projectCount: number;
  apiUsageLimitTotal: number;
};

type SortKey = "totalCount" | "projectCount" | "authId";

type Props = {
  data: UsageByAccountItem[];
};

export function UsageByAccountTable({ data }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? data.filter(
          (d) =>
            d.authId.toLowerCase().includes(q) ||
            (d.companyName ?? "").toLowerCase().includes(q),
        )
      : data;

    const sorted = [...base].sort((a, b) => {
      let v = 0;
      if (sortKey === "authId") {
        v = a.authId.localeCompare(b.authId);
      } else {
        v = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === "asc" ? v : -v;
    });
    return sorted;
  }, [data, query, sortKey, sortDir]);

  const visible = showAll ? filtered : filtered.slice(0, 20);
  const max = filtered[0]?.totalCount ?? 0;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div
      className={css({
        w: "full",
        p: 4,
        borderRadius: "xl",
        border: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        bg: { base: "white", _dark: "#18181B" },
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      })}
    >
      <VStack gap={3} alignItems="stretch">
        <HStack justify="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <span
            className={css({
              fontSize: "sm",
              color: "fg.muted",
            })}
          >
            全 {filtered.length.toLocaleString()} 件 / 表示 {visible.length.toLocaleString()} 件
          </span>
          <input
            placeholder="ID または会社名で検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={css({
              px: 3,
              py: 1.5,
              fontSize: "sm",
              borderRadius: "md",
              border: "1px solid",
              borderColor: { base: "#E4E4E7", _dark: "#27272A" },
              bg: { base: "white", _dark: "#0A0A0A" },
              minW: "240px",
              _focus: {
                outline: "none",
                borderColor: "#2563EB",
                boxShadow: "0 0 0 3px rgba(37,99,235,0.15)",
              },
            })}
          />
        </HStack>

        <div className={css({ overflowX: "auto" })}>
          <table
            className={css({
              w: "full",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: "sm",
            })}
          >
            <thead>
              <tr>
                <Th onClick={() => toggleSort("authId")} active={sortKey === "authId"} dir={sortDir}>
                  アカウント
                </Th>
                <Th
                  onClick={() => toggleSort("projectCount")}
                  active={sortKey === "projectCount"}
                  dir={sortDir}
                  align="right"
                >
                  プロジェクト数
                </Th>
                <Th
                  onClick={() => toggleSort("totalCount")}
                  active={sortKey === "totalCount"}
                  dir={sortDir}
                  align="right"
                >
                  今月のAPI使用量
                </Th>
                <th
                  className={css({
                    textAlign: "left",
                    px: 3,
                    py: 2,
                    fontWeight: "medium",
                    color: "fg.muted",
                    fontSize: "xs",
                    borderBottom: "1px solid",
                    borderColor: { base: "#E4E4E7", _dark: "#27272A" },
                    minW: "200px",
                  })}
                >
                  使用量
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row, idx) => {
                const ratio = max > 0 ? row.totalCount / max : 0;
                return (
                  <tr
                    key={row.authId}
                    className={css({
                      _hover: { bg: { base: "#F9FAFB", _dark: "#0A0A0A" } },
                    })}
                  >
                    <Td>
                      <VStack gap={0.5} alignItems="flex-start">
                        <span className={css({ fontWeight: "medium" })}>{row.authId}</span>
                        {row.companyName ? (
                          <span className={css({ fontSize: "xs", color: "fg.muted" })}>
                            {row.companyName}
                          </span>
                        ) : null}
                      </VStack>
                    </Td>
                    <Td align="right">{row.projectCount.toLocaleString()}</Td>
                    <Td align="right">
                      <span
                        className={css({
                          fontWeight: "semibold",
                          fontVariantNumeric: "tabular-nums",
                        })}
                      >
                        {row.totalCount.toLocaleString()}
                      </span>
                      {row.apiUsageLimitTotal > 0 ? (
                        <span
                          className={css({
                            ml: 1,
                            fontSize: "xs",
                            color: "fg.muted",
                          })}
                        >
                          / {row.apiUsageLimitTotal.toLocaleString()}
                        </span>
                      ) : null}
                    </Td>
                    <Td>
                      <div
                        className={css({
                          w: "full",
                          h: "6px",
                          borderRadius: "full",
                          overflow: "hidden",
                          bg: { base: "#F4F4F5", _dark: "#27272A" },
                        })}
                      >
                        <div
                          className={css({
                            h: "full",
                            borderRadius: "full",
                            transition: "width 300ms ease",
                          })}
                          style={{
                            width: `${Math.max(2, ratio * 100)}%`,
                            background:
                              idx < 3
                                ? "linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)"
                                : "#A1A1AA",
                          }}
                        />
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className={css({
                      textAlign: "center",
                      py: 8,
                      color: "fg.muted",
                      fontSize: "sm",
                    })}
                  >
                    該当するアカウントがありません
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {!showAll && filtered.length > 20 ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={css({
              alignSelf: "center",
              fontSize: "sm",
              color: "#2563EB",
              cursor: "pointer",
              py: 1,
              _hover: { textDecoration: "underline" },
            })}
          >
            すべて表示（残り {filtered.length - 20} 件）
          </button>
        ) : null}
      </VStack>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  align,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
  align?: "left" | "right";
}) {
  return (
    <th
      className={css({
        textAlign: align === "right" ? "right" : "left",
        px: 3,
        py: 2,
        fontWeight: "medium",
        color: "fg.muted",
        fontSize: "xs",
        cursor: "pointer",
        userSelect: "none",
        borderBottom: "1px solid",
        borderColor: { base: "#E4E4E7", _dark: "#27272A" },
        _hover: { color: "fg.default" },
      })}
      onClick={onClick}
    >
      <span>
        {children}
        {active ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </span>
    </th>
  );
}

function Td({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={css({
        textAlign: align === "right" ? "right" : "left",
        px: 3,
        py: 3,
        borderBottom: "1px solid",
        borderColor: { base: "#F4F4F5", _dark: "#1F1F22" },
        verticalAlign: "middle",
      })}
    >
      {children}
    </td>
  );
}
