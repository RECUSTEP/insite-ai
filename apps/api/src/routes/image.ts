import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as bucket from "../libs/bucket";
import { projectGuard } from "./_factory";

export const imageParamSchema = z.object({
  projectId: z.string(),
  filename: z.string(),
});

export const imageHandler = projectGuard.createHandlers(
  zValidator("param", imageParamSchema),
  async (c) => {
    const { projectId, filename } = c.req.valid("param");
    if (projectId !== c.var.session.projectId) {
      return c.text("Unauthorized", 401);
    }

    const path = `${projectId}/${filename}`;
    const image = await bucket.get(c, path);
    if (!image) {
      return c.text("Not found", 404);
    }

    const etag = c.req.header("If-None-Match");
    if (etag === image.httpEtag) {
      return new Response(null, { status: 304 });
    }

    const headers = new Headers();
    image.writeHttpMetadata(headers);
    headers.set("etag", image.httpEtag);

    return new Response(image.body, { headers });
  },
);

export const route = projectGuard.createApp().get("/:projectId/:filename", ...imageHandler);
