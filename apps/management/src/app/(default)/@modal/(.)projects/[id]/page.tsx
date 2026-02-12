import { UpdateProjectForm } from "@/app/(default)/(project)/projects/_components/update-project-form";
import { Modal } from "../../_components/modal";

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <Modal title="プロジェクトを編集">
      <UpdateProjectForm id={params.id} />
    </Modal>
  );
}
