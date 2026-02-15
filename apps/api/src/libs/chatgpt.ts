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

async function getOpenAiClient(applicationSettings: ApplicationSettingUseCase<"d1">) {
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
  const { client, model } = await getOpenAiClient(applicationSettings);
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
  const { client, model } = await getOpenAiClient(applicationSettings);
  return async function* (system: string, user: string, images?: File[]) {
    const systemMessage = {
      role: "system",
      content: system,
    } satisfies openAi.Chat.Completions.ChatCompletionSystemMessageParam;
    const userMessage = {
      role: "user",
      content: [{ type: "text", text: user } as openAi.Chat.Completions.ChatCompletionContentPart],
    } satisfies openAi.Chat.Completions.ChatCompletionUserMessageParam;
    for (const image of images ?? []) {
      userMessage.content.push({
        type: "image_url",
        image_url: { url: `data:${image.type};base64,${encodeBase64(await image.arrayBuffer())}` },
      });
    }
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

type SeoOutline = {
  title: string;
  sections: Array<{ heading: string; guidance: string }>;
  faqs: string[];
};

const DEFAULT_SECTIONS = ["結論", "背景", "具体的な実践方法", "注意点", "まとめ"];

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const m = trimmed.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

export function resolveFaqCountFromInstruction(instruction: string): number | undefined {
  const patterns = [/FAQ\s*[:：]?\s*(\d+)\s*個?/i, /よくある質問\s*[:：]?\s*(\d+)\s*個?/i];
  for (const p of patterns) {
    const m = instruction.match(p);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isInteger(n) && n > 0) return Math.min(10, n);
  }
  return undefined;
}

export async function generateSeoOutline(
  applicationSettings: ApplicationSettingUseCase<"d1">,
  params: {
    baseSystem: string;
    instruction: string;
    faqCount: number;
  },
): Promise<SeoOutline> {
  const system = `${params.baseSystem}

あなたは記事のアウトライン設計者です。本文は書かず、必ずJSONのみを返してください。`;
  const user = `以下の指示からSEO記事のアウトラインを作成してください。

要件:
- sections は5個以上
- faq は${params.faqCount}個
- sections には heading と guidance を入れる

JSON形式:
{"title":"...","sections":[{"heading":"...","guidance":"..."}],"faqs":["..."]}

指示:
${params.instruction}`;

  const raw = await chatgptOnce(applicationSettings, system, user);
  const parsed = extractJsonObject(raw) as {
    title?: unknown;
    sections?: Array<{ heading?: unknown; guidance?: unknown }>;
    faqs?: Array<unknown>;
  } | null;

  const sections =
    parsed?.sections
      ?.map((s) => ({
        heading: typeof s.heading === "string" ? s.heading.trim() : "",
        guidance: typeof s.guidance === "string" ? s.guidance.trim() : "",
      }))
      .filter((s) => s.heading.length > 0)
      .slice(0, 8) ?? [];

  const safeSections =
    sections.length > 0
      ? sections
      : DEFAULT_SECTIONS.map((heading) => ({
          heading,
          guidance: "具体例・数字・比較を含めて読者に行動指針を示す",
        }));

  const rawFaqs = (parsed?.faqs ?? [])
    .map((v) => {
      if (typeof v === "string") return v.trim();
      if (
        v &&
        typeof v === "object" &&
        "question" in v &&
        typeof (v as { question: unknown }).question === "string"
      ) {
        return (v as { question: string }).question.trim();
      }
      return "";
    })
    .filter((v) => v.length > 0);

  const faqs = Array.from({ length: params.faqCount }, (_, i) => {
    return rawFaqs[i] ?? `よくある質問${i + 1}`;
  });

  const title =
    typeof parsed?.title === "string" && parsed.title.trim().length > 0
      ? parsed.title.trim()
      : "SEO・AIO対策記事";

  return { title, sections: safeSections, faqs };
}

export async function generateSeoSection(
  applicationSettings: ApplicationSettingUseCase<"d1">,
  params: {
    baseSystem: string;
    instruction: string;
    heading: string;
    guidance: string;
    minChars: number;
    retryNote?: string;
  },
): Promise<string> {
  const system = `${params.baseSystem}

あなたは記事本文の執筆者です。見出しや箇条書きの前置きは不要で、本文のみ出力してください。`;
  const user = `見出し: ${params.heading}
補足: ${params.guidance}

指示: ${params.instruction}

要件:
- 最低${params.minChars}文字
- 具体例や理由を必ず含める
- 冗長な定型句を避ける
${
  params.retryNote
    ? `
再生成指示:
${params.retryNote}`
    : ""
}`;
  return (await chatgptOnce(applicationSettings, system, user)).trim();
}

export async function generateSeoFaqAnswer(
  applicationSettings: ApplicationSettingUseCase<"d1">,
  params: {
    baseSystem: string;
    instruction: string;
    question: string;
    minChars: number;
    retryNote?: string;
  },
): Promise<string> {
  const system = `${params.baseSystem}

あなたはFAQ回答作成者です。質問に直接答え、本文のみ返してください。`;
  const user = `質問: ${params.question}

背景指示: ${params.instruction}

要件:
- 最低${params.minChars}文字
- 結論を先に書く
- 根拠か具体例を1つ以上入れる
${
  params.retryNote
    ? `
再生成指示:
${params.retryNote}`
    : ""
}`;
  return (await chatgptOnce(applicationSettings, system, user)).trim();
}

export type ParsedSeoArticle = {
  title: string;
  sections: Array<{ heading: string; content: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

function flushSection(
  sections: Array<{ heading: string; content: string }>,
  heading: string | null,
  buffer: string[],
) {
  if (!heading) {
    return;
  }
  sections.push({
    heading,
    content: buffer.join("\n").trim(),
  });
}

function flushFaq(
  faqs: Array<{ question: string; answer: string }>,
  question: string | null,
  buffer: string[],
) {
  if (!question) {
    return;
  }
  faqs.push({
    question,
    answer: buffer.join("\n").trim(),
  });
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: stateful markdown parsing is intentional
export function parseSeoArticleMarkdown(markdown: string): ParsedSeoArticle {
  const lines = markdown.split(/\r?\n/);
  let title = "SEO・AIO対策記事";
  const sections: Array<{ heading: string; content: string }> = [];
  const faqs: Array<{ question: string; answer: string }> = [];

  let inFaq = false;
  let currentSectionHeading: string | null = null;
  let currentFaqQuestion: string | null = null;
  let sectionBuffer: string[] = [];
  let faqBuffer: string[] = [];

  for (const line of lines) {
    if (line.startsWith("# ") && title === "SEO・AIO対策記事") {
      title = line.replace(/^#\s+/, "").trim() || title;
      continue;
    }

    if (line.trim() === "## FAQ") {
      flushSection(sections, currentSectionHeading, sectionBuffer);
      currentSectionHeading = null;
      sectionBuffer = [];
      inFaq = true;
      continue;
    }

    if (!inFaq && line.startsWith("## ")) {
      flushSection(sections, currentSectionHeading, sectionBuffer);
      currentSectionHeading = line.replace(/^##\s+/, "").trim();
      sectionBuffer = [];
      continue;
    }

    if (inFaq && line.startsWith("### Q. ")) {
      flushFaq(faqs, currentFaqQuestion, faqBuffer);
      currentFaqQuestion = line.replace(/^###\s+Q\.\s+/, "").trim();
      faqBuffer = [];
      continue;
    }

    if (inFaq) {
      faqBuffer.push(line);
    } else if (currentSectionHeading) {
      sectionBuffer.push(line);
    }
  }

  flushSection(sections, currentSectionHeading, sectionBuffer);
  flushFaq(faqs, currentFaqQuestion, faqBuffer);

  return {
    title,
    sections,
    faqs,
  };
}

export function buildSeoArticleMarkdown(parsed: ParsedSeoArticle): string {
  const sectionsText = parsed.sections
    .map((section) => `## ${section.heading}\n\n${section.content.trim()}`)
    .join("\n\n");
  const faqText = parsed.faqs
    .map((faq) => `### Q. ${faq.question}\n\n${faq.answer.trim()}`)
    .join("\n\n");
  return `# ${parsed.title}\n\n${sectionsText}\n\n## FAQ\n\n${faqText}`.trim();
}

function normalizeText(input: string): string {
  return input.replace(/\s/g, "").toLowerCase();
}

export async function detectTargetSectionIndexes(
  applicationSettings: ApplicationSettingUseCase<"d1">,
  params: {
    baseSystem: string;
    revisionInstruction: string;
    sections: Array<{ heading: string; content: string }>;
  },
): Promise<number[]> {
  const directMatches = params.sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => {
      const normalizedHeading = normalizeText(section.heading);
      const normalizedInstruction = normalizeText(params.revisionInstruction);
      return normalizedHeading.length > 0 && normalizedInstruction.includes(normalizedHeading);
    })
    .map(({ index }) => index);
  if (directMatches.length > 0) {
    return Array.from(new Set(directMatches));
  }

  const numberedMatches = Array.from(
    params.revisionInstruction.matchAll(/(?:セクション|第)\s*(\d+)\s*(?:章|節)?/g),
  )
    .map((m) => Number(m[1]) - 1)
    .filter((n) => Number.isInteger(n) && n >= 0 && n < params.sections.length);
  if (numberedMatches.length > 0) {
    return Array.from(new Set(numberedMatches));
  }

  const system = `${params.baseSystem}

あなたは編集対象セクションの判定器です。JSON配列のみ返してください。`;
  const sectionList = params.sections
    .map((section, index) => `${index}: ${section.heading}`)
    .join("\n");
  const user = `修正指示に該当するセクション番号（0始まり）を判定してください。

セクション一覧:
${sectionList}

修正指示:
${params.revisionInstruction}

出力形式:
[0,2]`;
  const raw = await chatgptOnce(applicationSettings, system, user);
  const parsed = raw.match(/\[[\s\S]*\]/)?.[0];
  if (!parsed) {
    return [];
  }
  try {
    const indexes = JSON.parse(parsed) as unknown[];
    return indexes
      .map((v) => (typeof v === "number" ? v : Number(v)))
      .filter((v) => Number.isInteger(v) && v >= 0 && v < params.sections.length);
  } catch {
    return [];
  }
}

export async function reviseSeoSection(
  applicationSettings: ApplicationSettingUseCase<"d1">,
  params: {
    baseSystem: string;
    articleTitle: string;
    revisionInstruction: string;
    heading: string;
    originalContent: string;
    minChars?: number;
  },
): Promise<string> {
  const system = `${params.baseSystem}

あなたは記事修正担当です。対象セクションのみを書き換え、本文だけを返してください。`;
  const user = `記事タイトル: ${params.articleTitle}
対象セクション: ${params.heading}

修正指示:
${params.revisionInstruction}

現在の本文:
${params.originalContent}

要件:
- 修正指示に沿って内容を更新する
- 対象セクション以外の情報は推測で追加しすぎない
- 本文のみ出力する
${params.minChars ? `- 最低${params.minChars}文字` : ""}`;
  return (await chatgptOnce(applicationSettings, system, user)).trim();
}
