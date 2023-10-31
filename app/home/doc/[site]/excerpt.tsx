import { useConfirmModal } from "@/components/confirm-modal";
import Tooltip from "@/components/tooltip";
import { dateFromNow, formateDate } from "@/lib/utils";
import { Excerpt } from "@prisma/client";
import parse from "html-react-parser";
import Highlight from "react-highlight";
import { toast } from "sonner";

const Excerpt = ({
  excerpt,
  onDelete,
}: {
  excerpt: Excerpt;
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
        {excerpt.content.startsWith("<pre>") ? (
          <div className="bg-stone-600 rounded-lg">
            <Highlight>{parse(excerpt.content)}</Highlight>
          </div>
        ) : (
          <article className="prose prose-stone lg:prose-xl dark:prose-invert prose-code:bg-orange-200 prose-code:before:content-[] prose-code:after:content-[] prose-code:px-1 prose-code:py-1 prose-code:text-stone-600 prose-code:rounded-lg prose-a:text-yellow-600">
            {parse(excerpt.content)}
          </article>
        )}

        <div className="mt-2 flex flex-row text-stone-600 dark:text-stone-200 text-sm md:space-x-4">
          <Tooltip content={formateDate(excerpt.createAt.toString())}>
            <span>{dateFromNow(excerpt.createAt.toString())}</span>
          </Tooltip>
          <Tooltip content={excerpt.url}>
            <a href={excerpt.url} target="_black">
              Source
            </a>
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
