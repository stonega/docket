"use client";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function BackButton({ children }: { children: ReactNode }) {
  const router = useRouter();
  function back() {
    console.log(window.history.length);

    if (window.history.length === 1) {
      router.push("/home");
    } else {
      router.back();
    }
  }
  return (
    <div
      className="text-stone-500 dark:text-stone-200 flex flex-row items-center space-x-2 cursor-pointer"
      onClick={() => back()}
    >
      <ArrowLeftIcon className="w-4 h-4 text-stone-700 dark:text-stone-200" />
      {children}
    </div>
  );
}
