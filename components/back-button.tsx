"use client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import BackIcon from "./back-icon";

export default function BackButton({ children }: { children: ReactNode }) {
  const router = useRouter();
  function back() {
    if (window.history.length <= 1) {
      router.replace("/home");
    } else {
      router.back();
    }
  }

  return (
    <button
      type="button"
      className="group/back library-motion flex min-h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-stone-600 outline-none transition-[color,background-color,transform] duration-150 ease-out hover:bg-stone-100 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-yellow-400 active:scale-[0.98] dark:text-stone-300 dark:hover:bg-white/[0.07] dark:hover:text-white motion-reduce:transition-none"
      onClick={back}
    >
      <BackIcon className="size-4 transition-transform duration-150 ease-out group-hover/back:-translate-x-0.5 motion-reduce:transition-none" />
      {children}
    </button>
  );
}
