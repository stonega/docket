"use client";
import { siteOneColumnLayoutAtom } from "@/store";
import classnames from "classnames";
import { useAtom } from "jotai";

export default function Grid({ children }: { children: React.ReactNode }) {
  const [oneColumn] = useAtom(siteOneColumnLayoutAtom);
  return (
    <div
      className={classnames("w-full px-4 md:px-0 relative grid gap-4", {
        "grid-cols-1": oneColumn,
        "grid-cols-2 md:grid-cols-3": !oneColumn,
      })}
    >
      {children}
    </div>
  );
}
