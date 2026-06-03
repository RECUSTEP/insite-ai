import { Hono } from "hono";
import { route as adminRoute } from "./admin";
import { route as analysisRoute } from "./analysis";
import { route as announcesRoute } from "./announces";
import { route as chatSessionsRoute } from "./chat-sessions";
import { route as helpsRoute } from "./helps";
import { route as historyRoute } from "./history";
import { route as imageRoute } from "./image";
import { route as instructionGuideRoute } from "./instruction-guide";
import { route as loginRoute } from "./login";
import { route as logoutRoute } from "./logout";
import { route as metaRoute } from "./meta";
import { route as metaInsightsRoute } from "./meta-insights";
import { route as projectRoute } from "./project";
import { route as projectInfoRoute } from "./project-info";
import { route as projectsRoute } from "./projects";
import { route as seoArticleReviseRoute } from "./seo-article-revise";
import { route as seoSuggestKeywordsRoute } from "./seo-suggest-keywords";
import { route as sessionRoute } from "./session";

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
  .route("/seo-article-revise", seoArticleReviseRoute)
  .route("/seo-suggest-keywords", seoSuggestKeywordsRoute)
  .route("/announces", announcesRoute)
  .route("/chat-sessions", chatSessionsRoute)
  .route("/meta", metaRoute)
  .route("/meta-insights", metaInsightsRoute);
