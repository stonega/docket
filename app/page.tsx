import Link from "next/link";
import Header from "./header";
import { Connector, DocSitePanel, ExcerptPanel, Step } from "./diagram";
import ChromeLogo from "@/components/chrome-logo";
import Logo from "@/components/logo";

export default function Page() {
  return (
    <main className="flex flex-col items-center">
      <Header />
      <div className="h-screen flex flex-col items-center justify-center">
        <span
          className="
          text-4xl md:text-6xl font-serif dark:text-stone-100 text-center tracking-wide"
        >
          Docket is your document-reading assistant
        </span>
        <span
          className="
          text-2xl md:text-2xl mt-16 mx-10 md:mx-28 font-serif dark:text-stone-100 text-center tracking-wide leading-relaxed  "
        >
          Docket can assist you in{" "}
          <span className="highlight-text leading-relaxed">
            highlighting and saving text, code, and images while you read
            documents on the web
          </span>
          , especially for programming documents. It{" "}
          <span className="highlight-text leading-relaxed">
            automatically recognizes the URL of the document site and organizes
            the excerpts for you.
          </span>
        </span>
        <div className="flex flex-row space-x-4 mt-32">
          <a
            href="https://chromewebstore.google.com/detail/docket-highlighter/pbnonpcfnmdbfmabpjfllgljbfkccjco"
            target="_blank"
            className="border flex flex-row items-center px-4 py-2 dark:text-white border-gray-400 hover:border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-700"
          >
            <ChromeLogo className="w-6 h-6 mr-4"></ChromeLogo>
            Download Extension
          </a>
          <Link
            href="/home/"
            className="border flex flex-row items-center py-2 px-4 dark:text-white border-gray-400 hover:border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-700"
          >
            <Logo className="w-6 h-6 mr-4"></Logo>
            My Docket
          </Link>
        </div>
      </div>
        {/* <div className="h-[1200px] flex flex-row w-full bg-orange-600 justify-center items-center">
          <div className="flex flex-col space-y-8">
            <DocSitePanel></DocSitePanel>
            <DocSitePanel></DocSitePanel>
            <DocSitePanel></DocSitePanel>
          </div>
          <Connector></Connector>
          <ExcerptPanel></ExcerptPanel>
        </div> */}
      <div className="w-full py-8 bg-amber-100 flex flex-col items-center justify-center space-y-2 text-stone-600 dark:text-stone-200 dark:bg-amber-800">
        <Logo className="w-12 h-12 mb-3"></Logo>
        <Link
          href="/privacy"
          className="text-stone-600 dark:text-stone-200 text-md hover:text-yellow-400 underline underline-offset-4"
        >
          Privacy
        </Link>
        <div className="text-stone-600 dark:text-stone-200">
          All right reserved 2024
        </div>
      </div>
    </main>
  );
}
