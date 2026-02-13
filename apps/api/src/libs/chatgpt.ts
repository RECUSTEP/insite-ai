import type {
  ApplicationSettingUseCase,
  ProjectInfoUseCase,
  PromptUseCase,
} from "@repo/module/service";
import { omit } from "es-toolkit";
import { encodeBase64 } from "hono/utils/encode";
import openAi from "openai";

export function replacePlaceholders(template: string, values: Record<string, string>) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return key in values ? values[key] ?? "" : match;
  });
}

async function getOpenAIClient(applicationSettings: ApplicationSettingUseCase<"d1">) {
  const settings = await applicationSettings.getApplicationSetting();
  if (!settings.ok) {
    throw new Error("Application settings not found");
  }
  const apiKey = settings.val.find((setting) => setting.key === "openAiApiKey")?.value;
  const model = settings.val.find((setting) => setting.key === "chatGptModel")?.value;
  if (!apiKey || !model || !apiKey.trim() || !model.trim()) {
    throw new Error("OpenAI API key or model not found");
  }
  return { client: new openAi({ apiKey }), model };
}

/** 非ストリーミングで1回だけ ChatGPT を呼び出す（api_usage 加算なしの用途向け） */
export async function chatgptOnce(
  applicationSettings: ApplicationSettingUseCase<"d1">,
  system: string,
  user: string,
): Promise<string> {
  const { client, model } = await getOpenAIClient(applicationSettings);
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    stream: false,
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function chatgpt(applicationSettings: ApplicationSettingUseCase<"d1">) {
  const { client, model } = await getOpenAIClient(applicationSettings);
  return async function* (system: string, user: string, images?: File[]) {
    const systemMessage = {
      role: "system",
      content: system,
    } satisfies openAi.Chat.Completions.ChatCompletionSystemMessageParam;
    const userMessage = {
      role: "user",
      content: [{ type: "text", text: user } as openAi.Chat.Completions.ChatCompletionContentPart],
    } satisfies openAi.Chat.Completions.ChatCompletionUserMessageParam;
    images?.forEach(async (image) => {
      userMessage.content.push({
        type: "image_url",
        image_url: { url: `data:${image.type};base64,${encodeBase64(await image.arrayBuffer())}` },
      });
    });
    const stream = await client.chat.completions.create({
      model,
      messages: [systemMessage, userMessage],
      stream: true,
    });
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content ?? "";
    }
  };
}

export function getPrompt(
  promptUseCase: PromptUseCase<"d1">,
  projectInfoUseCase: ProjectInfoUseCase<"d1">,
) {
  return async (projectId: string, type: string, instruction?: string) => {
    const prompt = await promptUseCase.getPromptByAiType(type);
    if (!prompt.ok) {
      throw new Error("Prompt not found");
    }
    const projectInfo = await projectInfoUseCase.getProjectInfo({ projectId });
    const values = {
      ...(projectInfo.ok ? omit(projectInfo.val, ["id"]) : {}),
      instruction: instruction ?? "",
    };
    const isString = (v: unknown): v is string => typeof v === "string";
    const system = replacePlaceholders(prompt.val.system, filterObject(values, isString));
    const user = replacePlaceholders(prompt.val.user, filterObject(values, isString));
    return { system, user };
  };
}

function filterObject<T extends Record<string, unknown>, U>(
  obj: T,
  predicate: (value: unknown) => value is U,
) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => predicate(value))) as Record<
    string,
    U
  >;
}

/** コード内デフォルト（DB に seo-article プロンプトが無い場合に使用） */
export function getSeoArticleDefaultPrompt() {
  const system = `あなたはSEO・AIO向けの記事ライターです。以下のルールに従って記事を執筆してください。

【基本方針】
- 結論ファーストで、読者がすぐに要点を把握できる構成にする
- 体験談や独自の意見を盛り込み、説得力を高める
- 指定キーワードを自然な形で適切な回数配置する（不自然な詰め込みは避ける）

【文字数・構成】
- 文字数: 800〜1200字（instruction で指定があればそれに従う）
- 構成: 導入（1〜2文）→ 本論（H2見出しを3〜4個）→ まとめ

【禁止・注意】
- 「〜することができます」「様々な」の多用を避ける
- AIらしい紋切り型の表現を避け、人間らしい自然な文体にする
- トレンドや最新の動向を意識した内容にする

【プロジェクト情報】
業種・コンセプト・強み・ターゲット等の情報が \${businessType}、\${concept}、\${strength}、\${targetAge}、\${targetGender} などに含まれる場合は、それを踏まえて記事を執筆してください。`;

  const user = `以下のキーワード・指示に基づいて、SEO・AIO向けの記事を執筆してください。

\${instruction}`;

  return { system, user };
}
