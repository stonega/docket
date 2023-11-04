"use client";
import { FADE_IN_ANIMATION_SETTINGS } from "@/lib/constant";
import { motion } from "framer-motion";
import Popover from "@/components/popover";
import { useState } from "react";
import {
  DotsHorizontalIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useConfirmModal } from "@/components/confirm-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface MenuDropdownProps {
  link: string;
  siteId: string;
}
export default function MenuDropdown({ link, siteId }: MenuDropdownProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const router = useRouter();
  const { setShowConfirmModal, ConfirmModal } = useConfirmModal(async () => {
    await fetch(`/api/site/`, {
      method: "DELETE",
      body: JSON.stringify({ id: siteId }),
    });
    toast.success("Ste deleted");
    console.log(window.history.length);
    if (window.history.length === 1) {
      router.replace("/home");
    } else {
      router.back();
    }
    
  }, "Delete document site");
  return (
    <>
      <ConfirmModal>
        Are you sure you want to delete this document site? Deleting this
        document site is permanent and cannot be undone.
      </ConfirmModal>
      <motion.div
        className="relative inline-block text-left"
        {...FADE_IN_ANIMATION_SETTINGS}
      >
        <Popover
          content={
            <div className="w-full rounded-md bg-white p-2 dark:bg-[#101010] dark:text-white sm:w-40">
              <button
                className="relative text-red-400 font-semibold flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100 dark:hover:bg-green-800/30"
                onClick={() => setShowConfirmModal(true)}
              >
                <TrashIcon className="h-4 w-4" />
                <p className="text-sm">Delete</p>
              </button>
            </div>
          }
          align="end"
          openPopover={openPopover}
          setOpenPopover={setOpenPopover}
        >
          <div
            onClick={() => setOpenPopover(!openPopover)}
            className="flex h-10 cursor-pointer flex-row items-center justify-center overflow-hidden border-none transition-all duration-75 focus:border-none focus:outline-none active:scale-95"
          >
            <DotsHorizontalIcon />
          </div>
        </Popover>
      </motion.div>
    </>
  );
}
