"use client";

import { useConfirmModal } from "@/components/confirm-modal";
import { ReloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: { message?: string } };
    return body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export default function ArticleActions({
  articleId,
  selectedVersionId,
  historical,
}: {
  articleId: string;
  selectedVersionId: string;
  historical: boolean;
}) {
  const router = useRouter();
  const deleteModal = useConfirmModal(async () => {
    const response = await fetch(`/api/article/${articleId}`, { method: "DELETE" });
    if (!response.ok) throw new Error(await getErrorMessage(response, "Article could not be deleted"));
    toast.success("Article deleted. Its excerpts were kept.");
    router.push("/home?tab=articles");
    router.refresh();
  }, "Delete article");
  const restoreModal = useConfirmModal(async () => {
    const response = await fetch(`/api/article/${articleId}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: selectedVersionId }),
    });
    if (!response.ok) throw new Error(await getErrorMessage(response, "Version could not be restored"));
    toast.success("Version restored as a new current copy");
    router.replace(`/home/article/${articleId}`);
    router.refresh();
  }, "Restore this version", { confirmLabel: "Restore version", tone: "primary" });

  return (
    <>
      <deleteModal.ConfirmModal>
        Every saved version and its stored article body will be removed. Associated excerpts remain in your library.
      </deleteModal.ConfirmModal>
      <restoreModal.ConfirmModal>
        Docket will create a new current version from this snapshot. Existing history remains immutable.
      </restoreModal.ConfirmModal>
      <div className="flex flex-wrap items-center gap-2">
        {historical && (
          <button
            type="button"
            className="library-motion flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-3.5 text-sm font-medium text-white outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-[0.98] dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400 motion-reduce:transition-none"
            onClick={() => restoreModal.setShowConfirmModal(true)}
          >
            <ReloadIcon className="size-4" />
            Restore
          </button>
        )}
        <button
          type="button"
          className="library-motion flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium text-red-700 outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 active:scale-[0.98] dark:text-red-300 dark:hover:bg-red-950/40 motion-reduce:transition-none"
          onClick={() => deleteModal.setShowConfirmModal(true)}
        >
          <TrashIcon className="size-4" />
          Delete
        </button>
      </div>
    </>
  );
}
