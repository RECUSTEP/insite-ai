import * as schema from "@repo/db/schema";
import {
  AdminSessionUseCase,
  AnalysisHistoryUseCase,
  ApiUsageUseCase,
  ApplicationSettingUseCase,
  AuthUseCase,
  HelpUseCase,
  InstructionGuideUseCase,
  ProjectInfoUseCase,
  ProjectUseCase,
  PromptUseCase,
  SessionUseCase,
} from "@repo/module/service";
import { drizzle } from "drizzle-orm/d1";
import type { Hono } from "hono";
import { createFactory } from "hono/factory";
import type { Env } from "../env";

export const initApp = <E extends Env>(app: Hono<E>) => {
  app.use(async (c, next) => {
    const db = drizzle(c.env.DB, { schema });
    const authUseCase = new AuthUseCase<"d1">(db);
    const projectUseCase = new ProjectUseCase<"d1">(db);
    const apiUsageUseCase = new ApiUsageUseCase<"d1">(db);
    const analysisHistoryUseCase = new AnalysisHistoryUseCase<"d1">(db);
    const projectInfoUseCase = new ProjectInfoUseCase<"d1">(db);
    const adminSessionUseCase = new AdminSessionUseCase<"d1">(db, {
      sessionDuration: 1000 * 60 * 60 * 24 * 14,
    });
    const sessionUseCase = new SessionUseCase<"d1">(db, {
      sessionDuration: 1000 * 60 * 60 * 24 * 14,
    });
    const helpUseCase = new HelpUseCase<"d1">(db);
    const promptUseCase = new PromptUseCase<"d1">(db);
    const applicationSettingUseCase = new ApplicationSettingUseCase<"d1">(db);
    const instructionGuideUsecase = new InstructionGuideUseCase<"d1">(db);
    c.set("authUseCase", authUseCase);
    c.set("projectUseCase", projectUseCase);
    c.set("apiUsageUseCase", apiUsageUseCase);
    c.set("analysisHistoryUseCase", analysisHistoryUseCase);
    c.set("projectInfoUseCase", projectInfoUseCase);
    c.set("adminSessionUseCase", adminSessionUseCase);
    c.set("sessionUseCase", sessionUseCase);
    c.set("helpUseCase", helpUseCase);
    c.set("promptUseCase", promptUseCase);
    c.set("applicationSettingUseCase", applicationSettingUseCase);
    c.set("instructionGuideUsecase", instructionGuideUsecase);
    await next();
  });
};

export const factory = createFactory<Env>({
  initApp,
});
