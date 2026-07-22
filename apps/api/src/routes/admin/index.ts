import { Hono } from "hono";
import { route as announcesRoute } from "./announces";
import { route as applicationSettingsRoute } from "./application-settings";
import { route as authRoute } from "./auth";
import { route as creditPurchasesRoute } from "./credit-purchases";
import { route as dashboardStatsRoute } from "./dashboard-stats";
import { route as helpsRoute } from "./helps";
import { route as instructionGuideRoute } from "./instruction-guide";
import { route as loginRoute } from "./login";
import { route as projectsRoute } from "./projects";
import { route as promptsRoute } from "./prompts";
import { route as sessionRoute } from "./session";

export const route = new Hono()
  .route("/application-settings", applicationSettingsRoute)
  .route("/dashboard-stats", dashboardStatsRoute)
  .route("/credit-purchases", creditPurchasesRoute)
  .route("/helps", helpsRoute)
  .route("/login", loginRoute)
  .route("/projects", projectsRoute)
  .route("/prompts", promptsRoute)
  .route("/session", sessionRoute)
  .route("/instruction-guide", instructionGuideRoute)
  .route("/auth", authRoute)
  .route("/announces", announcesRoute);
