import { useConfirmModal } from "@/components/confirm-modal";
import ExcerptCard from "@/components/excerpt-card";
import Tooltip from "@/components/tooltip";
import { dateFromNow, formateDate } from "@/lib/utils";
import { Excerpt as ExcerptType } from "@prisma/client";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

export default function Excerpt({
  excerpt,
  siteUrl,
}: {
  excerpt: ExcerptType;
  siteUrl: string;
}) {
  const { setShowConfirmModal, ConfirmModal } = useConfirmModal(async () => {
    await fetch(`/api/excerpt/`, {
      method: "DELETE",
      body: JSON.stringify({ id: excerpt.id }),
    });
    toast.success("Excerpt deleted");
  }, "Delete excerpt");

  return (
    <>
      <ConfirmModal>
        Are you sure you want to delete this excerpt? Deleting this excerpt is
        permanent and cannot be undone.
      </ConfirmModal>
      <div className="py-3" key={excerpt.id}>
        <ExcerptCard excerpt={excerpt} />
        <div className="md:hidden mt-2 flex flex-col space-y-1 text-stone-600 dark:text-stone-200 text-normal">
          <div className="flex flex-row space-x-2">
            <span>{dateFromNow(excerpt.createAt.toString())}</span>
            <button
              className="inline"
              onClick={() => setShowConfirmModal(true)}
            >
              Delete
            </button>
          </div>
          <div className="w-auto px-1 ml-0 mr-auto bg-yellow-300 dark:bg-yellow-600 rounded-md text-stone-600">
            <a
              href={excerpt.url}
              target="_black"
              className="decoration-solid underline"
            >
              {excerpt.url === siteUrl
                ? "Source"
                : excerpt.url.replace(siteUrl, "")}
            </a>
            <ArrowTopRightIcon className="inline ml-1" />
          </div>
        </div>
        <div className="hidden md:flex mt-2 flex-row text-stone-600 dark:text-stone-200 text-normal space-x-4">
          <Tooltip content={decodeURI(excerpt.url)}>
            <div className=" bg-yellow-300 dark:bg-yellow-600 max-w-[70%] px-1 rounded-md flex flex-row items-center">
              <a
                href={excerpt.url}
                target="_black"
                className="decoration-solid underline line-clamp-1 break-all"
              >
                {excerpt.url === siteUrl
                  ? "Source"
                  : decodeURIComponent(excerpt.url.replace(siteUrl, ""))}
              </a>
              <ArrowTopRightIcon className="inline" />
            </div>
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

