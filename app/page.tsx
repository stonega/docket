import Link from "next/link";
import type { Metadata } from "next";
import Header from "./header";
import Image from "next/image";
import { fraunces } from "./fonts";
import ChromeLogo from "@/components/chrome-logo";
import classnames from "classnames";
import Logo from "@/components/logo";
import { Footer } from "./footer";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <div className="mt-[6px] grow grid grid-cols-1 lg:grid-cols-2 text-black">
        <div className="py-4 bg-[#ff90ee] border-r border-stone-400 dark:border-stone-600 flex flex-col items-center justify-center">
          <span
            className={classnames("uppercase text-[80px] md:text-[100px] font-bold border-y border-stone-400 dark:border-stone-600 text-center leading-[80px] md:leading-[100px]", fraunces.className)}
          >
            Docket
          </span>
          <span
            className="text-2xl md:text-2xl mt-16 mx-4 md:mx-28 text-center tracking-wide leading-relaxed"
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
          <Link
            href="/home/"
            className="rounded-md mt-6 border flex font-bold flex-row items-center py-2 px-4 border-stone-400 dark:border-stone-600 bg-yellow-100 hover:border-yellow-100"
          >
            <Logo className="w-6 h-6 mr-4 text-black"></Logo>
            Enter My Docket
          </Link>
        </div>
        <div className="bg-[#ffc900] py-2 flex flex-col items-center justify-center">
          <div className="flex px-6 lg:flex-row flex-col mt-4 space-y-4 lg:space-y-0 space-x-0 lg:space-x-4">
            <div className="text-xl p-4 rounded-md w-full max-w-full md:max-w-60 bg-[#e5c2ff] border border-stone-400 dark:border-stone-600">
              Select the text, right-click and choose{' '}
              <span className="text-orange-700 font-bold">
                Highlight and save to Docket
              </span>
            </div>
            <div className="text-xl p-4 rounded-md w-full max-w-full md:max-w-60 bg-[#a9effe] border border-stone-400 dark:border-stone-600">
              Right click on image and select{' '}
              <span className="text-green-600 font-bold">
                Save image to Docket
              </span>
            </div>
            <div className="text-xl p-4 rounded-md w-full max-w-full md:max-w-60 bg-[#ffd674] border border-stone-400 dark:border-stone-600">
              Save code by click little{' '}
              <Image
                alt="Docket"
                src="/apple-touch-icon.png"
                width={24}
                height={24}
                className="inline"
              />{' '}
              inside code block
            </div>
          </div>
          <span className="text-2xl md:text-2xl mt-16 mx-10 md:mx-28 text-center tracking-wide leading-relaxed text-black">Use Chrome extension to save Highlight from web.</span>
          <div className="flex flex-row space-x-4 mt-6">
            <a
              href="https://chromewebstore.google.com/detail/docket-highlighter/pbnonpcfnmdbfmabpjfllgljbfkccjco"
              target="_blank"
              className="border font-bold rounded-md flex flex-row items-center px-4 py-2 border-stone-400 dark:border-stone-600 hover:border-yellow-100 bg-yellow-100"
            >
              <ChromeLogo className="w-6 h-6 mr-4"></ChromeLogo>Download Extension</a>
          </div>
        </div>
      </div>
      <Footer />
    </main >
  );
}
