import Link from "next/link";
import Header from "./header";
import Tooltip from "@/components/tooltip";

export default function Page() {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <Header />
      <span
        className="
          text-6xl font-semibold font-serif dark:text-white text-center tracking-wide"
      >
        Docket is your document-reading assistant
      </span>
      <span
        className="
          text-3xl mt-10 mx-10 md:mx-28 font-serif dark:text-white text-center tracking-wide leading-relaxed"
      >
        Docket can assist you in{" "}
        <span className="highlight-text">
          highlighting and saving text, code, and images
        while you read documents on the web</span>, especially for programming
        documents. It{" "}
        <span className="highlight-text">
          automatically recognizes the URL of the document site and organizes
          the excerpts for you.
        </span>
      </span>
      <div className="flex flex-row space-x-4 mt-20">
        <a
          href=""
          className="border-2 px-4 py-2 dark:text-white border-yellow-300 font-bold hover:bg-yellow-100 dark:hover:bg-yellow-700"
        >
          Chrome Extension
        </a>
        <Link
          href="/home"
          className="border-2 py-2 px-4 dark:text-white border-yellow-300  font-bold hover:bg-yellow-100 dark:hover:bg-yellow-700"
        >
          My Docket
        </Link>
      </div>
    </main>
  );
}
