import { ProjectForm } from "@/app/(default)/_components/project-form";
import { createClient } from "@/lib/api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { updateProjectAction } from "../_actions/update-project";

type Props = {
  id: string;
};

export async function UpdateProjectForm({ id }: Props) {
  const client = createClient();
  const result = await client.admin.projects[":projectId"].$get(
    {
      param: { projectId: id },
    },
    {
      headers: {
        cookie: cookies().toString(),
      },
    },
  );

  if (!result.ok) {
    if (result.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch project");
  }

  const project = await result.json();
  const action = updateProjectAction.bind(null, project.projectId);

  return <ProjectForm defaultValue={project} action={action} />;
}
