"use server";

import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type AnnounceInput = {
  id?: number;
  title: string;
  content: string;
};

export async function saveAnnounce(input: AnnounceInput) {
  const client = createClient();

  if (input.id !== undefined) {
    // 更新
    const response = await client.admin.announces.$put(
      {
        json: {
          id: input.id,
          title: input.title,
          content: input.content,
        },
      },
      {
        headers: {
          cookie: cookies().toString(),
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update announce");
    }

    const result = await response.json();
    revalidatePath("/announces");
    return result;
  }

  // 新規作成
  const response = await client.admin.announces.$post(
    {
      json: {
        title: input.title,
        content: input.content,
      },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create announce");
  }

  const result = await response.json();
  revalidatePath("/announces");
  return result;
}

export async function deleteAnnounce(id: number) {
  const client = createClient();

  const response = await client.admin.announces[":id"].$delete(
    {
      param: {
        id: id.toString(),
      },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete announce");
  }

  revalidatePath("/announces");
  return true;
}
