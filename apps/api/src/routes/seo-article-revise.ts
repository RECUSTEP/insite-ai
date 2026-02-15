import { zValidator } from "@hono/zod-validator";
import { CommonUseCaseError } from "@repo/module/error";
import { omit } from "es-toolkit";
import { z } from "zod";
import {
  buildSeoArticleMarkdown,
  detectTargetSectionIndexes,
  getPrompt,
  getSeoArticleDefaultPrompt,
  parseSeoArticleMarkdown,
  replacePlaceholders,
  reviseSeoSection,
} from "../libs/chatgpt";
import { projectGuard } from "./_factory";

const reviseSeoArticleSchema = z.object({
  historyId: z.string().min(1, "履歴を選択してください"),
  revisionInstruction: z.string().min(1, "修正指示を入力してください"),
});

const handler = projectGuard.createHandlers(
  zValidator("json", reviseSeoArticleSchema),
  async (c) => {
    const { historyId, revisionInstruction } = c.req.valid("json");

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

    const historyResult = await c.var.analysisHistoryUseCase.getAnalysisHistory({ id: historyId });
    if (!historyResult.ok) {
      return c.json({ error: "履歴が見つかりません" }, 404);
    }
    const history = historyResult.val;
    if (history.projectId !== c.var.session.projectId || history.aiType !== "seo-article") {
      return c.json({ error: "SEO記事の履歴のみ修正できます" }, 400);
    }

    // プロジェクトのSEOアドオンフラグをチェック
    if (!project.val.seoAddonEnabled) {
      return c.json(
        { 
          error: "SEO/AIO記事生成機能は有効化されていません。管理者にお問い合わせください。" 
        }, 
        403
      );
    }

    const previousOutput = (history.output as { output?: unknown })?.output;
    if (typeof previousOutput !== "string" || previousOutput.trim().length === 0) {
      return c.json({ error: "修正対象の記事本文が見つかりません" }, 422);
    }
    const parsedArticle = parseSeoArticleMarkdown(previousOutput);
    if (parsedArticle.sections.length === 0) {
      return c.json({ error: "記事構造を解析できませんでした" }, 422);
    }

    let system: string;
    const prompt = await c.var.promptUseCase.getPromptByAiType("seo-article");
    if (!prompt.ok && prompt.val === CommonUseCaseError.NotFound) {
      const projectInfo = await c.var.projectInfoUseCase.getProjectInfo({
        projectId: c.var.session.projectId,
      });
      const values = {
        ...(projectInfo.ok ? omit(projectInfo.val, ["id"]) : {}),
        instruction: revisionInstruction,
      };
      const isString = (v: unknown): v is string => typeof v === "string";
      const filtered = Object.fromEntries(
        Object.entries(values).filter(([, v]) => isString(v)),
      ) as Record<string, string>;
      system = replacePlaceholders(getSeoArticleDefaultPrompt().system, filtered);
    } else {
      const promptResult = await getPrompt(c.var.promptUseCase, c.var.projectInfoUseCase)(
        c.var.session.projectId,
        "seo-article",
        revisionInstruction,
      );
      system = promptResult.system;
    }

    const targetSectionIndexes = await detectTargetSectionIndexes(c.var.applicationSettingUseCase, {
      baseSystem: system,
      revisionInstruction,
      sections: parsedArticle.sections,
    });
    if (targetSectionIndexes.length === 0) {
      return c.json(
        {
          error: "修正対象セクションを特定できませんでした。見出し名を含めて再入力してください。",
        },
        422,
      );
    }

    const nextSections = [...parsedArticle.sections];
    for (const targetIndex of targetSectionIndexes) {
      const targetSection = parsedArticle.sections[targetIndex];
      if (!targetSection) {
        continue;
      }
      const revised = await reviseSeoSection(c.var.applicationSettingUseCase, {
        baseSystem: system,
        articleTitle: parsedArticle.title,
        revisionInstruction,
        heading: targetSection.heading,
        originalContent: targetSection.content,
      });
      if (!revised) {
        return c.json({ error: "セクション再生成に失敗しました" }, 422);
      }
      nextSections[targetIndex] = {
        ...targetSection,
        content: revised,
      };
    }

    const revisedOutput = buildSeoArticleMarkdown({
      ...parsedArticle,
      sections: nextSections,
    });

    const rootId = history.revisionParentId ?? history.id;
    const historiesResult = await c.var.analysisHistoryUseCase.getAnalysisHistories({
      projectId: c.var.session.projectId,
    });
    if (!historiesResult.ok) {
      return c.json({ error: "Internal Server Error" }, 500);
    }
    const sameLineHistories = historiesResult.val.filter((v) => {
      return v.aiType === "seo-article" && (v.id === rootId || v.revisionParentId === rootId);
    });
    const maxVersion = sameLineHistories.reduce(
      (max, v) => Math.max(max, v.version ?? 1),
      history.version ?? 1,
    );
    const nextVersion = maxVersion + 1;

    const createResult = await c.var.analysisHistoryUseCase.createAnalysisHistory({
      projectId: c.var.session.projectId,
      aiType: "seo-article",
      revisionParentId: rootId,
      version: nextVersion,
      input: {
        instruction: revisionInstruction,
      },
      output: {
        output: revisedOutput,
      },
    });
    if (!createResult.ok) {
      return c.json({ error: "履歴保存に失敗しました" }, 500);
    }

    c.executionCtx.waitUntil(
      c.var.apiUsageUseCase.createApiUsage({
        projectId: c.var.session.projectId,
      }),
    );

    return c.json({
      output: revisedOutput,
      historyId: createResult.val.id,
      revisionParentId: rootId,
      version: nextVersion,
      updatedSectionIndexes: targetSectionIndexes,
    });
  },
);

export const route = projectGuard.createApp().post("/", ...handler);
