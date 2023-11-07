import Link from "next/link";
import Header from "./header";
import { Connector, DocSitePanel, ExcerptPanel } from "./diagram";

export default function Page() {
  return (
    <main className="flex flex-col items-center">
      <Header />
      <div className="h-screen flex flex-col items-center justify-center">
        <span
          className="
          text-6xl font-semibold font-serif dark:text-white text-center tracking-wide"
        >
          Docket is your document-reading assistant
        </span>
        <span
          className="
          text-3xl mt-16 mx-10 md:mx-28 font-serif dark:text-white text-center tracking-wide leading-relaxed"
        >
          Docket can assist you in{" "}
          <span className="highlight-text">
            highlighting and saving text, code, and images while you read
            documents on the web
          </span>
          , especially for programming documents. It{" "}
          <span className="highlight-text">
            automatically recognizes the URL of the document site and organizes
            the excerpts for you.
          </span>
        </span>
        <div className="flex flex-row space-x-4 mt-32">
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
      </div>
      {/* <div className="mt-60 h-[1000px] flex flex-row w-full bg-orange-600 justify-center items-center">
        <div className="flex flex-col space-y-8">
          <DocSitePanel></DocSitePanel>
          <DocSitePanel></DocSitePanel>
          <DocSitePanel></DocSitePanel>
        </div>
        <Connector></Connector>
        <ExcerptPanel></ExcerptPanel>
      </div> */}
      <div className="w-full py-8 bg-amber-100 flex flex-col items-center justify-center space-y-2 text-stone-600 dark:text-stone-200 dark:bg-amber-800">
        <div>Docket 2023</div>
        <Link
          href="/privacy"
          className="text-md hover:text-yellow-400 underline underline-offset-4"
        >
          Privacy policy
        </Link>
      </div>
    </main>
  );
}
