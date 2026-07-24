import { ExternalLinkIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export function Footer() {
  return <div className="w-full p-2 px-4 bg-black z-12 flex flex-col md:flex-row items-center justify-between space-y-2 text-white">
    <div className="inline-flex items-center space-x-4">
      <Link
        href="/"
        className="hover:text-yellow-400 underline underline-offset-4"
      >
        Home
      </Link>
      <Link
        href="/privacy"
        className="hover:text-yellow-400 underline underline-offset-4"
      >
        Privacy
      </Link>
    </div>
    <div className="inline-flex items-center space-x-4">
      <a
        href="https://chromewebstore.google.com/detail/docket-highlighter/pbnonpcfnmdbfmabpjfllgljbfkccjco"
        className="hover:text-yellow-400 underline underline-offset-4 inline-flex items-center"
      >
        Chrome Extension
        <ExternalLinkIcon className="size-4 ms-1" />
      </a>
      <a
        href="https://book.docket.space"
        className="hover:text-yellow-400 underline underline-offset-4 inline-flex items-center"
      >
        Book Excerpt
        <ExternalLinkIcon className="size-4 ms-1" />
      </a>
    </div>
  </div>
}
