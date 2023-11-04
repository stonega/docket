"use client";

import LoadingCircle from "@/components/loading-circle";
import { Site } from "@prisma/client";
import { Pencil2Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { toast } from "sonner";

export default function Title({ site }: { site: Site }) {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(site!.title);

  async function saveTitle() {
    if (title === site.title) {
      setEdit(false);
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/site", {
        method: "PUT",
        body: JSON.stringify({
          title,
          id: site.id,
        }),
      });
      toast.success("Title saved");
    } catch (error) {
    } finally {
      setLoading(false);
      setEdit(false);
    }
  }
  return (
    <>
      {edit ? (
        <input
          className="font-serif font-bold text-3xl inline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        ></input>
      ) : (
        <h1 className="font-serif font-bold text-3xl inline">{title}</h1>
      )}
      <div className="inline-block ml-2">
        {edit ? (
          loading ? (
            <LoadingCircle />
          ) : (
            <div className="flex flex-row space-x-2">
              <Cross2Icon
                className="w-4 h-4 text-stone-800 dark:text-stone-200"
                onClick={() => setEdit(false)}
              />
              <CheckIcon
                className="w-4 h-4 text-stone-800 dark:text-stone-200"
                onClick={() => saveTitle()}
              />
            </div>
          )
        ) : (
          <Pencil2Icon
            className="w-4 h-4 text-stone-800 dark:text-stone-200"
            onClick={() => setEdit(true)}
          />
        )}
      </div>
    </>
  );
}
