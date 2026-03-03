import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

const auth = sqliteTable("auth", {
  id: text("id").notNull().primaryKey(),
  password: text("password").notNull(),
});

const projects = sqliteTable(
  "project",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    authId: text("auth_id")
      .notNull()
      .references(() => auth.id),
    managerName: text("manager_name").notNull(),
    ownerName: text("owner_name").notNull(),
    projectId: text("project_id").unique().notNull(),
    projectPass: text("project_pass").notNull(),
    apiUsageLimit: integer("api_usage_limit").notNull(),
    seoAddonEnabled: integer("seo_addon_enabled", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => ({
    projectIdIdx: uniqueIndex("project_project_id_idx").on(table.projectId),
  }),
);

const apiUsage = sqliteTable(
  "api_usage",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    usedAt: integer("used_at").notNull(),
  },
  (table) => ({
    projectIdIdx: index("api_usage_project_id_idx").on(table.projectId),
    usedAtIdx: index("api_usage_used_at_idx").on(table.usedAt),
  }),
);

const analysisHistory = sqliteTable(
  "analysis_history",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    aiType: text("ai_type").notNull(),
    revisionParentId: text("revision_parent_id"),
    version: integer("version").notNull().default(1),
    input: text("input", { mode: "json" }).notNull(),
    output: text("output", { mode: "json" }).notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    projectIdIdx: index("analysis_history_project_id_idx").on(table.projectId),
    revisionParentIdIdx: index("analysis_history_revision_parent_id_idx").on(table.revisionParentId),
  }),
);

const projectInfo = sqliteTable(
  "project_info",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    businessType: text("business_type"),
    address: text("address"),
    nearestStation: text("nearest_station"),
    concept: text("concept"),
    strength: text("strength"),
    targetAge: text("target_age"),
    targetGender: text("targetGender"),
    targetArea: text("target_area"),
    targetAttribute: text("target_attribute"),
    targetConcern: text("target_concern"),
    existingCustomerAnalysis: text("existing_customer_analysis"),
    storeName: text("store_name"),
    instagramTemplate: text("instagram_template"),
    instagramKeyword1: text("instagram_keyword1"),
    instagramKeyword2: text("instagram_keyword2"),
    instagramKeyword3: text("instagram_keyword3"),
  },
  (table) => ({
    projectIdIdx: uniqueIndex("project_info_project_id_idx").on(table.projectId),
  }),
);

const sessions = sqliteTable(
  "session",
  {
    id: text("id").notNull().primaryKey(),
    authId: text("auth_id")
      .notNull()
      .references(() => auth.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .references(() => projects.projectId, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => ({
    idIdx: uniqueIndex("session_id_idx").on(table.id),
  }),
);

const adminSessions = sqliteTable(
  "admin_session",
  {
    id: text("id").notNull().primaryKey(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => ({
    idIdx: uniqueIndex("admin_session_id_idx").on(table.id),
  }),
);

const helps = sqliteTable(
  "help",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    aiType: text("ai_type").unique().notNull(),
    text: text("text").notNull(),
  },
  (table) => ({
    aiTypeIdx: uniqueIndex("help_ai_type_idx").on(table.aiType),
  }),
);

const prompts = sqliteTable(
  "prompt",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    aiType: text("ai_type").unique().notNull(),
    system: text("system").notNull(),
    user: text("user").notNull(),
  },
  (table) => ({
    aiTypeIdx: index("prompt_ai_type_idx").on(table.aiType),
  }),
);

const applicationSettings = sqliteTable(
  "application_settings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").unique().notNull(),
    value: text("value").notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex("application_settings_key_idx").on(table.key),
  }),
);

const instructionGuide = sqliteTable("instruction_guide", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  formName: text("form_name").unique().notNull(),
  text: text("text").notNull(),
});

const chatSessions = sqliteTable(
  "chat_sessions",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.projectId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    messages: text("messages", { mode: "json" }).notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    projectIdIdx: index("chat_sessions_project_id_idx").on(table.projectId),
  }),
);

const announces = sqliteTable("announce", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  project: one(projects, {
    fields: [chatSessions.projectId],
    references: [projects.projectId],
  }),
}));

const authRelations = relations(auth, ({ many }) => ({
  projects: many(projects),
}));

const projectRelations = relations(projects, ({ one, many }) => ({
  auth: one(auth, { fields: [projects.authId], references: [auth.id] }),
  apiUsage: many(apiUsage),
  analysisHistory: many(analysisHistory),
  chatSessions: many(chatSessions),
  projectInfo: one(projectInfo),
  sessions: many(sessions),
}));

const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  project: one(projects, {
    fields: [apiUsage.projectId],
    references: [projects.projectId],
  }),
}));

const analysisHistoryRelations = relations(analysisHistory, ({ one }) => ({
  project: one(projects, {
    fields: [analysisHistory.projectId],
    references: [projects.projectId],
  }),
}));

const projectInfoRelations = relations(projectInfo, ({ one }) => ({
  project: one(projects, {
    fields: [projectInfo.projectId],
    references: [projects.projectId],
  }),
}));

const sessionRelations = relations(sessions, ({ one }) => ({
  project: one(projects, {
    fields: [sessions.projectId],
    references: [projects.projectId],
  }),
}));

export {
  auth,
  projects,
  apiUsage,
  analysisHistory,
  chatSessions,
  projectInfo,
  sessions,
  adminSessions,
  helps,
  prompts,
  applicationSettings,
  instructionGuide,
  announces,
  authRelations,
  projectRelations,
  apiUsageRelations,
  analysisHistoryRelations,
  chatSessionsRelations,
  projectInfoRelations,
  sessionRelations,
};
