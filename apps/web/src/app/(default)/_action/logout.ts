"use server";

import { createClient } from "@/lib/api";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const client = createClient();
  const c = cookies();
  const response = await client.logout.$post(
    {},
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );
  if (!response.ok) {
    return;
  }
  response.headers
    .getSetCookie()
    .map((cookie) => parseSetCookie(cookie))
    .map((cookie) => cookie && c.set(cookie.name, cookie.value, cookie));
  redirect("/login");
}
