import * as schemas from "@repo/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export type AuthInsert = typeof schemas.auth.$inferInsert;
export const authInsertSchema = createInsertSchema(schemas.auth);

export type AuthSelect = typeof schemas.auth.$inferSelect;
export const authSelectSchema = createSelectSchema(schemas.auth);

export type ProjectInsert = typeof schemas.projects.$inferInsert;
export const projectInsertSchema = createInsertSchema(schemas.projects);

export type ProjectSelect = typeof schemas.projects.$inferSelect;
export const projectSelectSchema = createSelectSchema(schemas.projects);

export type ApiUsageInsert = typeof schemas.apiUsage.$inferInsert;
export const apiUsageInsertSchema = createInsertSchema(schemas.apiUsage);

export type ApiUsageSelect = typeof schemas.apiUsage.$inferSelect;
export const apiUsageSelectSchema = createSelectSchema(schemas.apiUsage);

export type AnalysisHistoryInsert = typeof schemas.analysisHistory.$inferInsert;
export const analysisHistoryInsertSchema = createInsertSchema(schemas.analysisHistory);

export type AnalysisHistorySelect = typeof schemas.analysisHistory.$inferSelect;
export const analysisHistorySelectSchema = createSelectSchema(schemas.analysisHistory);

export type ProjectInfoInsert = typeof schemas.projectInfo.$inferInsert;
export const projectInfoInsertSchema = createInsertSchema(schemas.projectInfo);

export type ProjectInfoSelect = typeof schemas.projectInfo.$inferSelect;
export const projectInfoSelectSchema = createSelectSchema(schemas.projectInfo);

export type SessionInsert = typeof schemas.sessions.$inferInsert;
export const sessionInsertSchema = createInsertSchema(schemas.sessions);

export type SessionSelect = typeof schemas.sessions.$inferSelect;
export const sessionSelectSchema = createSelectSchema(schemas.sessions);

export type AdminSessionInsert = typeof schemas.adminSessions.$inferInsert;
export const adminSessionInsertSchema = createInsertSchema(schemas.adminSessions);

export type AdminSessionSelect = typeof schemas.adminSessions.$inferSelect;
export const adminSessionSelectSchema = createSelectSchema(schemas.adminSessions);

export type HelpInsert = typeof schemas.helps.$inferInsert;
export const helpInsertSchema = createInsertSchema(schemas.helps);

export type HelpSelect = typeof schemas.helps.$inferSelect;
export const helpSelectSchema = createSelectSchema(schemas.helps);

export type PromptInsert = typeof schemas.prompts.$inferInsert;
export const promptInsertSchema = createInsertSchema(schemas.prompts);

export type PromptSelect = typeof schemas.prompts.$inferSelect;
export const promptSelectSchema = createSelectSchema(schemas.prompts);

export type ApplicationSettingInsert = typeof schemas.applicationSettings.$inferInsert;
export const applicationSettingInsertSchema = createInsertSchema(schemas.applicationSettings);

export type ApplicationSettingSelect = typeof schemas.applicationSettings.$inferSelect;
export const applicationSettingSelectSchema = createSelectSchema(schemas.applicationSettings);

export type InstructionGuideInsert = typeof schemas.instructionGuide.$inferInsert;
export const instructionGuideInsertSchema = createInsertSchema(schemas.instructionGuide);

export type InstructionGuideSelect = typeof schemas.instructionGuide.$inferSelect;
export const instructionGuideSelectSchema = createSelectSchema(schemas.instructionGuide);
