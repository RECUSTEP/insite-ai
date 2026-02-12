"use server";

import { revalidateTag } from "next/cache";

// biome-ignore lint/suspicious/useAwait: Server Action must be async
export async function revalidateTagAction(tag: string) {
  revalidateTag(tag);
}
