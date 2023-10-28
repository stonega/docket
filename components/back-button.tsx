'use client';
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter()
  return (
    <div
      className="text-stone-500 dark:text-stone-200 flex flex-row items-center space-x-2 cursor-pointer"
      onClick={() => router.back()}
    >
      <ArrowLeftIcon className="w-4 h-4 text-stone-500 dark:text-stone-200" />
      <span>Back</span>
    </div>
  );
}
