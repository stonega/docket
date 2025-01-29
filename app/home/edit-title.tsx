import Modal from "@/components/modal";
import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { toast } from "sonner";
import Button from "@/components/button";

const EditTitleModal = ({
  showEditTitleModal,
  setShowEditTitleModal,
  onConfirm,
  title,
  children,
}: {
  showEditTitleModal: boolean;
  setShowEditTitleModal: Dispatch<SetStateAction<boolean>>;
  onConfirm(): Promise<void>;
  title: string;
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
      setShowEditTitleModal(false);
    } catch (error) {
      if (error instanceof Error) toast(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal
      showModal={showEditTitleModal}
      setShowModal={setShowEditTitleModal}
      clickToClose={false}
    >
      <div className="w-full overflow-hidden bg-white dark:bg-stone-900 md:max-w-md md:rounded-md md:shadow-xl">
        <div className="px-6 pt-8 text-2xl font-semibold text-stone-700 dark:text-stone-100">
          {title}
        </div>
        <div className="px-6 pt-4 text-xl text-stone-700 dark:text-stone-100">
          {children}
        </div>
        <div className="px-6 flex flex-row items-center justify-end space-x-6">
          <Button
            className="w-30 mb-6 mt-6 px-6 font-normal border-gray-500! bg-gray-300! outline-gray-500!"
            onClick={() => {
              localStorage.removeItem("path");
              setShowEditTitleModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-30 mb-6 mt-6 px-6 font-normal border-red-500! bg-red-300! outline-red-500!"
            onClick={() => {
              confirm();
            }}
            loading={loading}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export function useEditTitleModal(
  onConfirm: () => Promise<void>,
  title: string
) {
  const [showModal, setShowModal] = useState(false);

  const ModalCallback = useCallback(
    ({ children }: { children: ReactNode }) => {
      return (
        <EditTitleModal
          showEditTitleModal={showModal}
          setShowEditTitleModal={setShowModal}
          onConfirm={onConfirm}
          title={title}
        >
          {children}
        </EditTitleModal>
      );
    },
    [showModal, onConfirm, title]
  );

  return useMemo(
    () => ({ setShowModal, ConfirmModal: ModalCallback }),
    [setShowModal, ModalCallback]
  );
}
