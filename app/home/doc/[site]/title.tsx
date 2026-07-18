"use client";
import LoadingCircle from "@/components/loading-circle";
import { Site } from "@prisma/client";
import { Pencil2Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { fraunces } from "@/app/fonts";

export default function Title({ site }: { site: Site }) {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(site.title);
  const router = useRouter();

  useEffect(() => {
    setTitle(site.title);
  }, [site.title]);

  async function saveTitle() {
    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("Title cannot be empty");
      return;
    }
    if (nextTitle === site.title) {
      setEdit(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nextTitle,
          id: site.id,
        }),
      });
      if (!response.ok) throw new Error("The title could not be saved");

      setTitle(nextTitle);
      toast.success("Title saved");
      setEdit(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  function cancelEdit() {
    setTitle(site.title);
    setEdit(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveTitle();
  }

  return (
    <div className="group/title mt-1.5 min-w-0">
      {edit ? (
        <form
          className="flex w-full items-center gap-2"
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          <input
            autoFocus
            aria-label="Site title"
            className={`${fraunces.className} min-w-0 grow rounded-xl border border-sites-300 bg-white px-3 py-2 text-2xl font-semibold tracking-[-0.035em] text-stone-950 outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/50 dark:border-sites-800 dark:bg-white/[0.07] dark:text-white dark:focus:border-yellow-700 dark:focus:ring-yellow-900/30 sm:text-4xl`}
            value={title}
            disabled={loading}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancelEdit();
            }}
          />
          {loading ? (
            <span className="flex size-9 shrink-0 items-center justify-center text-stone-500">
              <LoadingCircle />
            </span>
          ) : (
            <>
              <button
                type="button"
                aria-label="Cancel editing title"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-stone-500 transition-colors duration-150 hover:bg-white hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none"
                onClick={cancelEdit}
              >
                <Cross2Icon className="size-4" />
              </button>
              <button
                type="submit"
                aria-label="Save title"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-950 text-white transition-[background-color,transform] duration-150 ease-out hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 active:scale-[0.97] dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200 motion-reduce:transition-none"
              >
                <CheckIcon className="size-4" />
              </button>
            </>
          )}
        </form>
      ) : (
        <div className="flex items-start gap-2">
          <h1
            className={`${fraunces.className} min-w-0 text-2xl font-semibold leading-tight tracking-[-0.04em] text-stone-950 dark:text-white sm:text-4xl`}
          >
            {title}
          </h1>
          <button
            type="button"
            aria-label="Edit title"
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-stone-400 opacity-80 transition-[color,background-color,opacity] duration-150 hover:bg-white hover:text-stone-950 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none sm:mt-1.5"
            onClick={() => setEdit(true)}
          >
            <Pencil2Icon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
