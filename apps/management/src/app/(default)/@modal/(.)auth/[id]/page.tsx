import { UpdateAuthForm } from "@/app/(default)/auth/[id]/_components/update-auth-form";
import { Modal } from "../../_components/modal";

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <Modal title="認証情報を編集">
      <UpdateAuthForm id={params.id} />
    </Modal>
  );
}
