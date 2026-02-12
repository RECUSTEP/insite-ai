import { Hono } from "hono";
import { route as applicationSettingsRoute } from "./application-settings";
import { route as helpsRoute } from "./helps";
import { route as loginRoute } from "./login";
import { route as projectsRoute } from "./projects";
import { route as promptsRoute } from "./prompts";
import { route as sessionRoute } from "./session";
import { route as instructionGuideRoute } from "./instruction-guide";
import { route as authRoute } from "./auth";

export const route = new Hono()
  .route("/application-settings", applicationSettingsRoute)
  .route("/helps", helpsRoute)
  .route("/login", loginRoute)
  .route("/projects", projectsRoute)
  .route("/prompts", promptsRoute)
  .route("/session", sessionRoute)
  .route("/instruction-guide", instructionGuideRoute)
  .route("/auth", authRoute);
