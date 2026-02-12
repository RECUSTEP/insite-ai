import { HistoryDetail } from "../../[id]/_components/history-detail";
import { Modal } from "./_components/modal";

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  return (
    <Modal title="利用履歴">
      <HistoryDetail id={params.id} />
    </Modal>
  );
}
