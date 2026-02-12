import { ProjectForm } from "../../_components/project-form";
import { createProjectAction } from "../_actions/create-project";

export function CreateProjectForm() {
  return <ProjectForm action={createProjectAction} />;
}
