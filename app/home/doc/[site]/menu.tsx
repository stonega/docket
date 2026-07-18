"use client";
import Popover from "@/components/popover";
import { useState } from "react";
import { DotsHorizontalIcon, TrashIcon } from "@radix-ui/react-icons";
import { useConfirmModal } from "@/components/confirm-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface MenuDropdownProps {
  siteId: string;
}

export default function MenuDropdown({ siteId }: MenuDropdownProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const router = useRouter();
  const { setShowConfirmModal, ConfirmModal } = useConfirmModal(async () => {
    const response = await fetch("/api/site", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: siteId }),
    });
    if (!response.ok) throw new Error("The site could not be deleted");

    toast.success("Site deleted");
    router.replace("/home");
  }, "Delete site");
  return (
    <>
      <ConfirmModal>
        Are you sure you want to delete this document site? Deleting this
        document site is permanent and cannot be undone.
      </ConfirmModal>
      <div className="relative inline-block text-left">
        <Popover
          content={
            <div className="w-full rounded-xl border border-stone-200 bg-white p-1.5 text-stone-950 shadow-xl dark:border-white/10 dark:bg-[#0a2328] dark:text-white sm:w-48">
              <p className="px-2 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Site actions
              </p>
              <button
                type="button"
                className="flex min-h-9 w-full items-center justify-start gap-2 rounded-lg px-2 text-left text-sm font-medium text-red-700 outline-none transition-colors duration-150 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-300 dark:hover:bg-red-950/40 motion-reduce:transition-none"
                onClick={() => {
                  setOpenPopover(false);
                  setShowConfirmModal(true);
                }}
              >
                <TrashIcon className="size-4" />
                <span>Delete site</span>
              </button>
            </div>
          }
          align="end"
          openPopover={openPopover}
          setOpenPopover={setOpenPopover}
        >
          <button
            type="button"
            aria-label="Open site actions"
            onClick={() => setOpenPopover(!openPopover)}
            className="library-motion flex size-9 items-center justify-center rounded-xl text-stone-500 outline-none transition-[color,background-color,transform] duration-150 ease-out hover:bg-stone-100 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-yellow-400 active:scale-[0.96] dark:text-stone-300 dark:hover:bg-white/[0.07] dark:hover:text-white motion-reduce:transition-none"
          >
            <DotsHorizontalIcon className="size-4" />
          </button>
        </Popover>
      </div>
    </>
  );
}
