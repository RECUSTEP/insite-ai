import { ProjectForm } from "../../_components/project-form";
import { createProjectAction } from "../_actions/create-project";

type Props = {
  defaultAuthId?: string;
};

export function CreateProjectForm({ defaultAuthId }: Props) {
  return (
    <ProjectForm
      action={createProjectAction}
      defaultValue={defaultAuthId ? { authId: defaultAuthId } : undefined}
    />
  );
}
