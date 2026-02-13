import { zValidator } from "@hono/zod-validator";
import { fileUpload } from "@repo/configuration";
import { streamText } from "hono/streaming";
import { z } from "zod";
import { upload } from "../libs/bucket";
import { chatgpt, getPrompt, getSeoArticleDefaultPrompt, replacePlaceholders } from "../libs/chatgpt";
import { CommonUseCaseError } from "@repo/module/error";
import { omit } from "es-toolkit";
import { projectGuard } from "./_factory";
import { validator } from "hono/validator";

const { acceptExtensions, acceptMimeTypes, maxFileSizeMb, maxFileSize } = fileUpload;

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
    instruction: z.string({ message: "キーワードを入力してください" }).min(1, "キーワードを入力してください"),
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
  // validate instruction
  const parsed = z.string().optional().safeParse(value["instruction"]);
  if (!parsed.success) {
    return c.json({ error: parsed.error }, 400);
  }
  const instruction = parsed.data;

  // validate images (skip instruction - for instruction-only types like seo-article)
  const form = await c.req.formData();
  const images: File[] = [];
  form.forEach((v: unknown, key: string) => {
    if (key === "instruction") return;
    if (!(v instanceof File)) return;
    const parsed = imageSchema.safeParse(v);
    if (!parsed.success) {
      return c.json({ error: parsed.error }, 400);
    }
    images.push(parsed.data);
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
    const chat = (await chatgpt(c.var.applicationSettingUseCase))(
      system,
      user,
      "images" in form ? form.images : undefined,
    );

    let image: string | undefined = undefined;
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
      for await (const text of chat) {
        stream.write(text);
        output += text;
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
