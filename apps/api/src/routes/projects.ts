import { projectGuard } from "./_factory";

const getProjectsHandler = projectGuard.createHandlers(async (c) => {
  const { authId } = c.var.session;
  const projectResult = await c.var.projectUseCase.getByAuthId(authId);
  if (!projectResult.ok) {
    return c.json({ error: projectResult.val }, 400);
  }

  return c.json(
    projectResult.val.map((p) => ({
      projectId: p.projectId,
      name: p.name,
    })),
  );
});

export const route = projectGuard.createApp().get("/", ...getProjectsHandler);
