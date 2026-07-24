import { fraunces } from "@/app/fonts";
import Header from "@/app/header";
import { SignIn } from "@clerk/nextjs";
import classnames from "classnames";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center w-full">
      <Header />
      <div className="grow grid grid-cols-1 md:grid-cols-2 w-full">
        <div
          className={classnames(
            "text-black w-full h-full bg-[#ffc900] border-r border-black dark:border-white px-8 py-1 text-5xl inline-flex items-center font-semibold",
            fraunces.className
          )}
        >
          Docket is your document-reading assistant.
        </div>
        <div className="h-full bg-[#23a094] flex flex-row justify-center items-center">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
