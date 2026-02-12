import { createProjectAction } from "../_actions/create-project";
import { ProjectForm } from "./project-form";

export function CreateProjectForm() {
  return <ProjectForm action={createProjectAction} />;
}
