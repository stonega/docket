import { useConfirmModal } from "@/components/confirm-modal";
import ExcerptCard from "@/components/excerpt-card";
import Tooltip from "@/components/tooltip";
import { dateFromNow, formateDate } from "@/lib/utils";
import { Excerpt } from "@prisma/client";
import parse from "html-react-parser";
import Highlight from "react-highlight";
import { toast } from "sonner";

const Excerpt = ({
  excerpt,
  siteUrl,
  onDelete,
}: {
  excerpt: Excerpt;
  siteUrl: string;
  onDelete(): void;
}) => {
  const { setShowConfirmModal, ConfirmModal } = useConfirmModal(async () => {
    await fetch(`/api/excerpt/`, {
      method: "DELETE",
      body: JSON.stringify({ id: excerpt.id }),
    });
    toast.success("Excerpt deleted");
    onDelete();
  }, "Delete excerpt");

  return (
    <>
      <ConfirmModal>
        Are you sure you want to delete this excerpt? Deleting this excerpt is
        permanent and cannot be undone.
      </ConfirmModal>
      <div className="py-2" key={excerpt.id}>
        <ExcerptCard excerpt={excerpt} />

        <div className="mt-2 flex flex-row text-stone-600 dark:text-stone-200 text-sm md:space-x-4">
          <Tooltip content={excerpt.url}>
            <a
              href={excerpt.url}
              target="_black"
              className="decoration-solid underline"
            >
              {excerpt.url.replace(siteUrl, "")}
            </a>
          </Tooltip>
          <Tooltip content={formateDate(excerpt.createAt.toString())}>
            <span>{dateFromNow(excerpt.createAt.toString())}</span>
          </Tooltip>
          <Tooltip content="Delete excerpt">
            <button onClick={() => setShowConfirmModal(true)}>Delete</button>
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default Excerpt;
