"use server";

import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleSeoAddonAction(
  projectId: string,
  enabled: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createClient();

    const response = await client.admin.projects[":projectId"].$patch(
      { 
        param: { projectId }, 
        json: { seoAddonEnabled: enabled } 
      },
      { headers: { cookie: cookies().toString() } },
    );

    if (!response.ok) {
      return { success: false, error: "更新に失敗しました" };
    }

    // ページのキャッシュを再検証
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "サーバーエラーが発生しました" };
  }
}
