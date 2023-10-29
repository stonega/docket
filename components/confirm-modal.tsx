import Modal from "@/components/modal";
import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  ReactNode,
  use,
} from "react";
import { toast } from "sonner";
import Button from "./button";

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  onConfirm,
  title,
  children,
}: {
  showConfirmModal: boolean;
  setShowConfirmModal: Dispatch<SetStateAction<boolean>>;
  onConfirm(): Promise<void>;
  title: string;
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
      setShowConfirmModal(false);
    } catch (error) {
      if (error instanceof Error) toast(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal
      showModal={showConfirmModal}
      setShowModal={setShowConfirmModal}
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
            className="w-30 mb-6 mt-6 !border-red-500 !bg-red-300 px-6 font-normal !outline-red-500"
            onClick={() => {
              localStorage.removeItem("path");
              setShowConfirmModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-30 mb-6 mt-6 px-6 font-normal"
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

export function useConfirmModal(onConfirm: () => Promise<void>, title: string) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const ConfirmModalCallback = useCallback(
    ({ children }: { children: ReactNode }) => {
      return (
        <ConfirmModal
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          onConfirm={onConfirm}
          title={title}
        >
          {children}
        </ConfirmModal>
      );
    },
    [showConfirmModal, onConfirm, title]
  );

  return useMemo(
    () => ({ setShowConfirmModal, ConfirmModal: ConfirmModalCallback }),
    [setShowConfirmModal, ConfirmModalCallback]
  );
}
