import { CreateProjectForm } from "../../new/_components/create-project-form";
import { Modal } from "../_components/modal";

export default function Page() {
  return (
    <Modal title="新しいプロジェクト">
      <CreateProjectForm />
    </Modal>
  );
}
