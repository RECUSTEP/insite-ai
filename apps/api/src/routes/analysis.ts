import { zValidator } from "@hono/zod-validator";
import { fileUpload } from "@repo/configuration";
import { ApiUsageUseCaseError, CommonUseCaseError } from "@repo/module/error";
import { omit } from "es-toolkit";
import { streamText } from "hono/streaming";
import { validator } from "hono/validator";
import { z } from "zod";
import { upload } from "../libs/bucket";
import {
  type ConversationMessage,
  chatgpt,
  generateSeoFaqAnswer,
  generateSeoOutline,
  generateSeoSection,
  getPrompt,
  getSeoArticleDefaultPrompt,
  replacePlaceholders,
  resolveFaqCountFromInstruction,
} from "../libs/chatgpt";
import { projectGuard } from "./_factory";

const { acceptExtensions, acceptMimeTypes, maxFileSizeMb, maxFileSize } = fileUpload;

const SEO_MIN_TOTAL_CHARS = 3000;
const SEO_MIN_SECTION_CHARS = 400;
const SEO_MIN_FAQ_CHARS = 200;
const SEO_TARGET_SECTION_CHARS = 500;
const SEO_TARGET_FAQ_CHARS = 220;

type SeoSectionDraft = {
  heading: string;
  guidance: string;
  content: string;
  chars: number;
};

type SeoFaqDraft = {
  question: string;
  answer: string;
  chars: number;
};

type SeoValidationIssue = {
  index: number;
  label: string;
  currentChars: number;
  requiredChars: number;
  missingChars: number;
};

const countChars = (text: string) => text.replace(/\s/g, "").length;

const buildSeoOutput = (title: string, sections: SeoSectionDraft[], faqs: SeoFaqDraft[]) => {
  const sectionBlock = sections
    .map(
      (section) => `## ${section.heading}

${section.content.trim()}`,
    )
    .join("\n\n");
  const faqBlock = faqs
    .map(
      (faq) => `### Q. ${faq.question}

${faq.answer.trim()}`,
    )
    .join("\n\n");
  return `# ${title}

${sectionBlock}

## FAQ

${faqBlock}`.trim();
};

const getValidationIssues = (
  sections: SeoSectionDraft[],
  faqs: SeoFaqDraft[],
  totalChars: number,
) => {
  const insufficientSections: SeoValidationIssue[] = sections
    .map((section, index) => ({
      index,
      label: section.heading,
      currentChars: section.chars,
      requiredChars: SEO_MIN_SECTION_CHARS,
      missingChars: Math.max(0, SEO_MIN_SECTION_CHARS - section.chars),
    }))
    .filter((section) => section.missingChars > 0);

  const insufficientFaqs: SeoValidationIssue[] = faqs
    .map((faq, index) => ({
      index,
      label: faq.question,
      currentChars: faq.chars,
      requiredChars: SEO_MIN_FAQ_CHARS,
      missingChars: Math.max(0, SEO_MIN_FAQ_CHARS - faq.chars),
    }))
    .filter((faq) => faq.missingChars > 0);

  const totalShortage = Math.max(0, SEO_MIN_TOTAL_CHARS - totalChars);

  return {
    insufficientSections,
    insufficientFaqs,
    totalShortage,
  };
};

export const imageSchema = z
  .custom<File>((value) => value instanceof File, {
    message: "ファイルの形式が不適切です",
  })
  .refine((file) => file.size <= maxFileSize, {
    message: `ファイルサイズが${maxFileSizeMb}MBを超えています`,
  })
  .refine((file) => acceptMimeTypes.includes(file?.type), {
    message: `${acceptExtensions.join(", ")}形式の画像を選択してください`,
  });

const toneStyleSchema = z
  .enum(["formal-serious", "pop", "standard", "strict", "gentle"])
  .optional();

const instagramWritingAiSchema = z
  .object({
    images: z.array(imageSchema),
    instruction: z.string({ message: "指示を入力してください" }),
    toneStyle: toneStyleSchema,
  })
  .refine((data) => data.images.length > 0 || data.instruction.length > 0, {
    message: "画像か指示のどちらかを入力してください",
  });

export const analysisSchemaByType = {
  market: z.object({
    images: z.array(imageSchema),
    toneStyle: toneStyleSchema,
  }),
  competitor: z.object({
    images: z.array(imageSchema),
    toneStyle: toneStyleSchema,
  }),
  account: z.object({
    images: z.array(imageSchema),
    toneStyle: toneStyleSchema,
  }),
  insight: z.object({
    images: z.array(imageSchema),
    toneStyle: toneStyleSchema,
  }),
  improvement: z.object({
    images: z.array(imageSchema),
    instruction: z.string({ message: "指示を入力してください" }),
    toneStyle: toneStyleSchema,
  }),
  "improvement-no-image": z.object({
    instruction: z.string({ message: "指示を入力してください" }),
    toneStyle: toneStyleSchema,
  }),
  "feed-post": instagramWritingAiSchema,
  "reel-and-stories": instagramWritingAiSchema,
  profile: instagramWritingAiSchema,
  "google-map": z.object({
    images: z.array(imageSchema),
    instruction: z.string({ message: "指示を入力してください" }),
    toneStyle: toneStyleSchema,
  }),
  "google-map-no-image": z.object({
    instruction: z.string({ message: "指示を入力してください" }),
    toneStyle: toneStyleSchema,
  }),
  threads: instagramWritingAiSchema,
  "threads-no-image": z.object({
    instruction: z.string({ message: "指示を入力してください" }),
    toneStyle: toneStyleSchema,
  }),
  "seo-article": z.object({
    instruction: z
      .string({ message: "キーワードを入力してください" })
      .min(1, "キーワードを入力してください"),
    perspective: z.enum(["third-party", "representative"]).optional().default("representative"),
  }),
} as const;

export const analysisQuerySchema = z.object({
  type: z.union(
    [
      z.literal("market"),
      z.literal("competitor"),
      z.literal("account"),
      z.literal("insight"),
      z.literal("improvement"),
      z.literal("improvement-no-image"),
      z.literal("feed-post"),
      z.literal("reel-and-stories"),
      z.literal("profile"),
      z.literal("google-map"),
      z.literal("google-map-no-image"),
      z.literal("threads"),
      z.literal("threads-no-image"),
      z.literal("seo-article"),
    ],
    { message: "Invalid type" },
  ),
});

const conversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const TONE_STYLE_PROMPTS: Record<string, string> = {
  "formal-serious":
    "以下のトーン・文体で出力してください：やや堅めで真面目な表現。丁寧語を多用し、信頼感を重視する。",
  pop: "以下のトーン・文体で出力してください：ポップで親しみやすい表現。絵文字やカジュアルな言い回しを適度に使い、明るい印象にする。",
  standard:
    "以下のトーン・文体で出力してください：標準的なビジネス表現。バランスの取れた丁寧さと親しみやすさを両立する。",
  strict:
    "以下のトーン・文体で出力してください：厳しめで率直な表現。核心を突く、簡潔な言い回しを心がける。",
  gentle:
    "以下のトーン・文体で出力してください：優しく温かみのある表現。柔らかい言葉遣いで、相手を安心させる。",
};

const formValidator = validator("form", async (value, c) => {
  const parsed = z.string().optional().safeParse(value.instruction);
  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }
  const instruction = parsed.data;

  const conversationHistoryRaw = z.string().optional().safeParse(value.conversationHistory);
  let conversationHistory: ConversationMessage[] | undefined;
  if (conversationHistoryRaw.success && conversationHistoryRaw.data) {
    try {
      const parsed = z
        .array(conversationMessageSchema)
        .safeParse(JSON.parse(conversationHistoryRaw.data));
      if (parsed.success) {
        conversationHistory = parsed.data.slice(-20);
      }
    } catch {
      // ignore invalid JSON
    }
  }

  const form = await c.req.formData();
  const images: File[] = [];
  form.forEach((v: unknown, key: string) => {
    if (key === "instruction") return;
    if (key === "conversationHistory") return;
    if (key === "toneStyle") return;
    if (!(v instanceof File)) return;
    const parsedImage = imageSchema.safeParse(v);
    if (!parsedImage.success) {
      return c.json({ error: parsedImage.error }, 400);
    }
    images.push(parsedImage.data);
  });
  const toneStyleRaw = form.get("toneStyle");
  const toneStyle =
    typeof toneStyleRaw === "string" && toneStyleRaw.length > 0 ? toneStyleRaw : undefined;
  return {
    instruction,
    images,
    conversationHistory,
    toneStyle,
  };
});

const analysisHandler = projectGuard.createHandlers(
  zValidator("query", analysisQuerySchema),
  formValidator,
  async (c) => {
    const { projectId } = c.var.session;
    if (!projectId) {
      return c.json(
        {
          error:
            "プロジェクトが選択されていません。プロジェクトを作成するか、プロジェクトを選択してください。",
        },
        400,
      );
    }
    const { type } = c.req.valid("query");
    const result = await analysisSchemaByType[type].safeParseAsync(c.req.valid("form"));

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    const form = result.data;

    const project = await c.var.projectUseCase.getProject({
      projectId,
    });

    if (!project.ok) {
      return c.json({ error: "Internal Server Error" }, 500);
    }

    let system: string;
    let user: string;
    if (type === "seo-article") {
      // プロジェクトのSEOアドオンフラグをチェック
      if (!project.val.seoAddonEnabled) {
        return c.json(
          {
            error: "SEO/AIO記事生成機能は有効化されていません。管理者にお問い合わせください。",
          },
          403,
        );
      }

      const prompt = await c.var.promptUseCase.getPromptByAiType("seo-article");
      if (!prompt.ok && prompt.val === CommonUseCaseError.NotFound) {
        const projectInfo = await c.var.projectInfoUseCase.getProjectInfo({
          projectId,
        });
        const values = {
          ...(projectInfo.ok ? omit(projectInfo.val, ["id"]) : {}),
          instruction: "instruction" in form ? form.instruction ?? "" : "",
        };
        const isString = (v: unknown): v is string => typeof v === "string";
        const filtered = Object.fromEntries(
          Object.entries(values).filter(([, v]) => isString(v)),
        ) as Record<string, string>;
        const perspective =
          "perspective" in form &&
          (form.perspective === "third-party" || form.perspective === "representative")
            ? form.perspective
            : ("representative" as const);
        const defaultPrompt = getSeoArticleDefaultPrompt(perspective);
        system = replacePlaceholders(defaultPrompt.system, filtered);
        user = replacePlaceholders(defaultPrompt.user, filtered);
      } else {
        const got = await getPrompt(c.var.promptUseCase, c.var.projectInfoUseCase)(
          projectId,
          type,
          "instruction" in form ? form.instruction : undefined,
        );
        system = got.system;
        user = got.user;
      }
    } else {
      const getPromptFor = getPrompt(c.var.promptUseCase, c.var.projectInfoUseCase);
      const instruction = "instruction" in form ? form.instruction : undefined;
      try {
        const got = await getPromptFor(projectId, type, instruction);
        system = got.system;
        user = got.user;
      } catch (e) {
        // AIコンサルタント（画像あり=improvement）のプロンプトが未設定の環境では
        // getPrompt が "Prompt not found" で throw し、画像付き相談が全て
        // 「エラーが発生しました。」で失敗していた。AI相談（improvement-no-image）の
        // プロンプトにフォールバックして、画像付き相談を動作させる。
        if (type === "improvement") {
          const got = await getPromptFor(projectId, "improvement-no-image", instruction);
          system = got.system;
          user = got.user;
        } else {
          throw e;
        }
      }
    }

    if (
      type !== "seo-article" &&
      "toneStyle" in form &&
      form.toneStyle &&
      TONE_STYLE_PROMPTS[form.toneStyle]
    ) {
      system += `\n\n${TONE_STYLE_PROMPTS[form.toneStyle]}`;
    }

    // 外部API呼び出し前に使用量を確定する。ストリーム切断時にも未加算にしない。
    const usageResult = await c.var.apiUsageUseCase.consumeApiUsage({
      projectId,
      feature: type,
    });
    if (!usageResult.ok) {
      if (usageResult.val === ApiUsageUseCaseError.MonthlyLimitExceeded) {
        return c.json({ error: "Monthly API usage limit exceeded" }, 403);
      }
      console.error("[POST /analysis] Failed to record API usage:", usageResult.val);
      return c.json({ error: "Failed to record API usage" }, 500);
    }

    let outputFromSeoFlow: string | null = null;
    let chat: AsyncGenerator<string> | null = null;

    if (type === "seo-article") {
      const instruction = "instruction" in form ? form.instruction : "";
      const faqCount = resolveFaqCountFromInstruction(instruction) ?? 3;
      const outline = await generateSeoOutline(c.var.applicationSettingUseCase, {
        baseSystem: system,
        instruction,
        faqCount,
      });

      const sections: SeoSectionDraft[] = [];
      for (const section of outline.sections) {
        const content = await generateSeoSection(c.var.applicationSettingUseCase, {
          baseSystem: system,
          instruction,
          heading: section.heading,
          guidance: section.guidance,
          minChars: SEO_TARGET_SECTION_CHARS,
        });
        sections.push({
          heading: section.heading,
          guidance: section.guidance,
          content,
          chars: countChars(content),
        });
      }

      const faqs: SeoFaqDraft[] = [];
      for (const question of outline.faqs) {
        const answer = await generateSeoFaqAnswer(c.var.applicationSettingUseCase, {
          baseSystem: system,
          instruction,
          question,
          minChars: SEO_TARGET_FAQ_CHARS,
        });
        faqs.push({
          question,
          answer,
          chars: countChars(answer),
        });
      }

      let output = buildSeoOutput(outline.title, sections, faqs);
      let totalChars = countChars(output);
      let issues = getValidationIssues(sections, faqs, totalChars);

      for (const issue of issues.insufficientSections) {
        const targetSection = sections[issue.index];
        if (!targetSection) continue;
        const retry = await generateSeoSection(c.var.applicationSettingUseCase, {
          baseSystem: system,
          instruction,
          heading: targetSection.heading,
          guidance: targetSection.guidance,
          minChars: SEO_MIN_SECTION_CHARS,
          retryNote: `前回は${issue.currentChars}文字で、最低基準まで${issue.missingChars}文字不足しました。足りない分を補ってください。`,
        });
        targetSection.content = retry;
        targetSection.chars = countChars(retry);
      }

      for (const issue of issues.insufficientFaqs) {
        const targetFaq = faqs[issue.index];
        if (!targetFaq) continue;
        const retry = await generateSeoFaqAnswer(c.var.applicationSettingUseCase, {
          baseSystem: system,
          instruction,
          question: targetFaq.question,
          minChars: SEO_MIN_FAQ_CHARS,
          retryNote: `前回は${issue.currentChars}文字で、最低基準まで${issue.missingChars}文字不足しました。結論と根拠を補ってください。`,
        });
        targetFaq.answer = retry;
        targetFaq.chars = countChars(retry);
      }

      if (
        issues.totalShortage > 0 &&
        issues.insufficientSections.length === 0 &&
        sections.length > 0
      ) {
        const targetIndex = sections.reduce((shortestIndex, current, currentIndex, arr) => {
          return current.chars < (arr[shortestIndex]?.chars ?? Number.MAX_SAFE_INTEGER)
            ? currentIndex
            : shortestIndex;
        }, 0);
        const targetSection = sections[targetIndex];
        if (!targetSection) {
          return c.json({ error: "文字数基準未達です。再生成をお試しください。" }, 422);
        }
        const retry = await generateSeoSection(c.var.applicationSettingUseCase, {
          baseSystem: system,
          instruction,
          heading: targetSection.heading,
          guidance: targetSection.guidance,
          minChars: targetSection.chars + issues.totalShortage,
          retryNote: `記事全体が最低基準まで${issues.totalShortage}文字不足しています。前回より具体例を増やして分量を補ってください。`,
        });
        targetSection.content = retry;
        targetSection.chars = countChars(retry);
      }

      output = buildSeoOutput(outline.title, sections, faqs);
      totalChars = countChars(output);
      issues = getValidationIssues(sections, faqs, totalChars);

      if (
        issues.insufficientSections.length > 0 ||
        issues.insufficientFaqs.length > 0 ||
        issues.totalShortage > 0
      ) {
        return c.json(
          {
            error: "文字数基準未達です。再生成をお試しください。",
            details: {
              total: {
                currentChars: totalChars,
                requiredChars: SEO_MIN_TOTAL_CHARS,
                missingChars: issues.totalShortage,
              },
              sections: issues.insufficientSections,
              faqs: issues.insufficientFaqs,
            },
          },
          422,
        );
      }

      outputFromSeoFlow = output;
    } else {
      const isConsultType = type === "improvement" || type === "improvement-no-image";
      const rawForm = c.req.valid("form");
      chat = (await chatgpt(c.var.applicationSettingUseCase))(
        system,
        user,
        "images" in form ? form.images : undefined,
        isConsultType ? rawForm.conversationHistory : undefined,
      );
    }

    let image: string | undefined;
    if ("images" in form && form.images[0] instanceof File) {
      image = await upload(c, projectId, form.images[0]);
    }

    return streamText(c, async (stream) => {
      let output = "";
      if (type === "seo-article") {
        output = outputFromSeoFlow ?? "";
        stream.write(output);
      } else {
        for await (const text of chat ?? []) {
          stream.write(text);
          output += text;
        }
      }

      await c.var.analysisHistoryUseCase.createAnalysisHistory({
        projectId,
        aiType: type,
        input: JSON.parse(
          JSON.stringify({
            image,
            instruction: "instruction" in form ? form.instruction : undefined,
          }),
        ),
        output: {
          output,
        },
      });
    });
  },
);

export const route = projectGuard.createApp().post("/", ...analysisHandler);
