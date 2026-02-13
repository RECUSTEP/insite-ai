import { Hono } from "hono";
import { route as adminRoute } from "./admin";
import { route as analysisRoute } from "./analysis";
import { route as helpsRoute } from "./helps";
import { route as historyRoute } from "./history";
import { route as imageRoute } from "./image";
import { route as loginRoute } from "./login";
import { route as logoutRoute } from "./logout";
import { route as projectRoute } from "./project";
import { route as projectsRoute } from "./projects";
import { route as projectInfoRoute } from "./project-info";
import { route as sessionRoute } from "./session";
import { route as instructionGuideRoute } from "./instruction-guide";
import { route as seoSuggestKeywordsRoute } from "./seo-suggest-keywords";

export const route = new Hono()
  .route("/admin", adminRoute)
  .route("/analysis", analysisRoute)
  .route("/helps", helpsRoute)
  .route("/history", historyRoute)
  .route("/image", imageRoute)
  .route("/login", loginRoute)
  .route("/logout", logoutRoute)
  .route("/project", projectRoute)
  .route("/projects", projectsRoute)
  .route("/project_info", projectInfoRoute)
  .route("/session", sessionRoute)
  .route("/instruction-guide", instructionGuideRoute)
  .route("/seo-suggest-keywords", seoSuggestKeywordsRoute);
