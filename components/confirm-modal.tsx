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
import LoadingCircle from "./loading-circle";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import classnames from "classnames";

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  onConfirm,
  title,
  confirmLabel,
  tone,
  children,
}: {
  showConfirmModal: boolean;
  setShowConfirmModal: Dispatch<SetStateAction<boolean>>;
  onConfirm(): Promise<void>;
  title: string;
  confirmLabel: string;
  tone: "danger" | "primary";
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
      setShowConfirmModal(false);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
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
      <div
        className="w-full overflow-hidden border border-stone-200 bg-white text-stone-950 dark:border-white/10 dark:bg-[#171417] dark:text-white md:max-w-md md:rounded-2xl md:shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start gap-4 px-6 pb-3 pt-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <ExclamationTriangleIcon className="size-4" />
          </span>
          <div>
            <h2
              id="confirm-modal-title"
              className="text-lg font-semibold tracking-[-0.02em]"
            >
              {title}
            </h2>
            <div className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {children}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-4">
          <button
            type="button"
            className="min-h-10 rounded-xl px-4 text-sm font-medium text-stone-600 outline-none transition-colors duration-150 hover:bg-stone-100 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-yellow-400 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none"
            disabled={loading}
            onClick={() => {
              setShowConfirmModal(false);
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className={classnames(
              "flex min-h-10 min-w-24 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-white outline-none transition-[background-color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 dark:focus-visible:ring-offset-[#171417] motion-reduce:transition-none",
              tone === "danger"
                ? "bg-red-700 hover:bg-red-800 focus-visible:ring-red-400 dark:bg-red-600 dark:hover:bg-red-500"
                : "bg-stone-900 hover:bg-stone-800 focus-visible:ring-yellow-400 dark:bg-yellow-500 dark:text-stone-950 dark:hover:bg-yellow-400",
            )}
            disabled={loading}
            onClick={() => void confirm()}
          >
            <span>{confirmLabel}</span>
            {loading && <LoadingCircle />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export function useConfirmModal(
  onConfirm: () => Promise<void>,
  title: string,
  options: { confirmLabel?: string; tone?: "danger" | "primary" } = {},
) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const ConfirmModalCallback = useCallback(
    ({ children }: { children: ReactNode }) => {
      return (
        <ConfirmModal
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          onConfirm={onConfirm}
          title={title}
          confirmLabel={options.confirmLabel ?? "Delete"}
          tone={options.tone ?? "danger"}
        >
          {children}
        </ConfirmModal>
      );
    },
    [showConfirmModal, onConfirm, title, options.confirmLabel, options.tone],
  );

  return useMemo(
    () => ({ setShowConfirmModal, ConfirmModal: ConfirmModalCallback }),
    [setShowConfirmModal, ConfirmModalCallback],
  );
}
