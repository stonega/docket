import Logo from "@/components/logo";
import Link from "next/link";

export function Footer() {
  return <div className="w-full py-8 bg-black border-t dark:border-white z-[12] flex flex-col items-center justify-center space-y-2 text-white">
    <Logo className="w-12 mb-3 text-yellow-400"></Logo>
    <Link
      href="/privacy"
      className="text-md hover:text-yellow-400 underline underline-offset-4"
    >
      Privacy
    </Link>
    <div>
      All right reserved 2025
    </div>
  </div>
}
