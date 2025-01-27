"use client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import BackIcon from "./back-icon";

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
      className="text-black dark:text-white flex flex-row items-center space-x-2 cursor-pointer"
      onClick={() => back()}
    >
      <BackIcon className="size-6" />
      {children}
    </div>
  );
}
