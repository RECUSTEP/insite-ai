import { zValidator } from "@hono/zod-validator";
import { fileUpload } from "@repo/configuration";
import { CommonUseCaseError } from "@repo/module/error";
import { omit } from "es-toolkit";
import { streamText } from "hono/streaming";
import { validator } from "hono/validator";
import { z } from "zod";
import { upload } from "../libs/bucket";
import {
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

const instagramWritingAiSchema = z
  .object({
    images: z.array(imageSchema),
    instruction: z.string({ message: "指示を入力してください" }),
  })
  .refine((data) => data.images.length > 0 || data.instruction.length > 0, {
    message: "画像か指示のどちらかを入力してください",
  });

export const analysisSchemaByType = {
  market: z.object({
    images: z.array(imageSchema),
  }),
  competitor: z.object({
    images: z.array(imageSchema),
  }),
  account: z.object({
    images: z.array(imageSchema),
  }),
  insight: z.object({
    images: z.array(imageSchema),
  }),
  improvement: z.object({
    images: z.array(imageSchema),
    instruction: z.string({ message: "指示を入力してください" }),
  }),
  "improvement-no-image": z.object({
    instruction: z.string({ message: "指示を入力してください" }),
  }),
  "feed-post": instagramWritingAiSchema,
  "reel-and-stories": instagramWritingAiSchema,
  profile: instagramWritingAiSchema,
  "google-map": z.object({
    images: z.array(imageSchema),
    instruction: z.string({ message: "指示を入力してください" }),
  }),
  "google-map-no-image": z.object({
    instruction: z.string({ message: "指示を入力してください" }),
  }),
  "seo-article": z.object({
    instruction: z
      .string({ message: "キーワードを入力してください" })
      .min(1, "キーワードを入力してください"),
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
      z.literal("seo-article"),
    ],
    { message: "Invalid type" },
  ),
});

const formValidator = validator("form", async (value, c) => {
  const parsed = z.string().optional().safeParse(value.instruction);
  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }
  const instruction = parsed.data;

  const form = await c.req.formData();
  const images: File[] = [];
  form.forEach((v: unknown, key: string) => {
    if (key === "instruction") return;
    if (!(v instanceof File)) return;
    const parsedImage = imageSchema.safeParse(v);
    if (!parsedImage.success) {
      return c.json({ error: parsedImage.error }, 400);
    }
    images.push(parsedImage.data);
  });
  return {
    instruction,
    images,
  };
});

const analysisHandler = projectGuard.createHandlers(
  zValidator("query", analysisQuerySchema),
  formValidator,
  async (c) => {
    const { type } = c.req.valid("query");
    const result = await analysisSchemaByType[type].safeParseAsync(c.req.valid("form"));

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    const form = result.data;

    const project = await c.var.projectUseCase.getProject({
      projectId: c.var.session.projectId,
    });
    const monthlyUsage = await c.var.apiUsageUseCase.getMonthlyApiUsageCount({
      projectId: c.var.session.projectId,
    });

    if (!project.ok || !monthlyUsage.ok) {
      return c.json({ error: "Internal Server Error" }, 500);
    }

    if (project.val.apiUsageLimit <= monthlyUsage.val) {
      return c.json({ error: "Monthly API usage limit exceeded" }, 403);
    }

    let system: string;
    let user: string;
    if (type === "seo-article") {
      const prompt = await c.var.promptUseCase.getPromptByAiType("seo-article");
      if (!prompt.ok && prompt.val === CommonUseCaseError.NotFound) {
        const projectInfo = await c.var.projectInfoUseCase.getProjectInfo({
          projectId: c.var.session.projectId,
        });
        const values = {
          ...(projectInfo.ok ? omit(projectInfo.val, ["id"]) : {}),
          instruction: "instruction" in form ? form.instruction ?? "" : "",
        };
        const isString = (v: unknown): v is string => typeof v === "string";
        const filtered = Object.fromEntries(
          Object.entries(values).filter(([, v]) => isString(v)),
        ) as Record<string, string>;
        const defaultPrompt = getSeoArticleDefaultPrompt();
        system = replacePlaceholders(defaultPrompt.system, filtered);
        user = replacePlaceholders(defaultPrompt.user, filtered);
      } else {
        const got = await getPrompt(c.var.promptUseCase, c.var.projectInfoUseCase)(
          c.var.session.projectId,
          type,
          "instruction" in form ? form.instruction : undefined,
        );
        system = got.system;
        user = got.user;
      }
    } else {
      const got = await getPrompt(c.var.promptUseCase, c.var.projectInfoUseCase)(
        c.var.session.projectId,
        type,
        "instruction" in form ? form.instruction : undefined,
      );
      system = got.system;
      user = got.user;
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
      chat = (await chatgpt(c.var.applicationSettingUseCase))(
        system,
        user,
        "images" in form ? form.images : undefined,
      );
    }

    let image: string | undefined;
    if ("images" in form && form.images[0] instanceof File) {
      image = await upload(c, c.var.session.projectId, form.images[0]);
    }

    c.executionCtx.waitUntil(
      c.var.apiUsageUseCase.createApiUsage({
        projectId: c.var.session.projectId,
      }),
    );

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
        projectId: c.var.session.projectId,
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
