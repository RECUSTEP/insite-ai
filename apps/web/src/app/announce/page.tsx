import { readFile } from "node:fs/promises";
import { MarkdownRenderer } from "@/components/markdown";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "お知らせ",
};

export default async function Page() {
  const file = await readFile("src/app/announce/announce.md", "utf-8");
  return <MarkdownRenderer>{file}</MarkdownRenderer>;
}
