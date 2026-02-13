import { omit } from "es-toolkit";
import { projectGuard } from "./_factory";
import { chatgptOnce, replacePlaceholders } from "../libs/chatgpt";

const SYSTEM_PROMPT = `あなたはSEO・AIO向けのキーワード提案の専門家です。
与えられた店舗・サービスの情報を基に、ブログ記事や口コミ投稿で効果的なキーワードを提案してください。`;

const USER_PROMPT_TEMPLATE = `以下の店舗・サービス情報を基に、SEO・AIOで有効なキーワードを5〜10個提案してください。
JSON配列のみで返してください。例: ["キーワード1", "キーワード2", "キーワード3"]

【店舗・サービス情報】
業種: \${businessType}
コンセプト: \${concept}
強み: \${strength}
ターゲット年齢: \${targetAge}
ターゲット性別: \${targetGender}
ターゲット地域: \${targetArea}
ターゲット属性: \${targetAttribute}
ターゲットの悩み: \${targetConcern}
既存顧客分析: \${existingCustomerAnalysis}
住所: \${address}
最寄り駅: \${nearestStation}`;

const handler = projectGuard.createHandlers(async (c) => {
  const projectInfo = await c.var.projectInfoUseCase.getProjectInfo({
    projectId: c.var.session.projectId,
  });
  const projectInfoValues: Record<string, unknown> = projectInfo.ok
    ? omit(projectInfo.val, ["id", "projectId"])
    : {};
  const keys = [
    "businessType", "concept", "strength", "targetAge", "targetGender",
    "targetArea", "targetAttribute", "targetConcern", "existingCustomerAnalysis",
    "address", "nearestStation",
  ];
  const values: Record<string, string> = Object.fromEntries(
    keys.map((k) => [
      k,
      typeof projectInfoValues[k] === "string" ? (projectInfoValues[k] as string) : "",
    ]),
  );
  const user = replacePlaceholders(USER_PROMPT_TEMPLATE, values);

  const responseText = await chatgptOnce(c.var.applicationSettingUseCase, SYSTEM_PROMPT, user);

  const parsed = parseKeywordsFromResponse(responseText);
  if (parsed.ok) {
    return c.json({ keywords: parsed.val });
  }
  return c.json({ suggestions: responseText });
});

function parseKeywordsFromResponse(raw: string): { ok: true; val: string[] } | { ok: false } {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return { ok: false };
  try {
    const arr = JSON.parse(jsonMatch[0]) as unknown;
    if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) {
      return { ok: true, val: arr };
    }
  } catch {
    // ignore
  }
  return { ok: false };
}

export const route = projectGuard.createApp().post("/", ...handler);
