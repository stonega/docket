import { fraunces } from "@/app/fonts";
import Header from "@/app/header";
import { SignUp } from "@clerk/nextjs";
import classnames from "classnames";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <div className="grow grid grid-cols-1 md:grid-cols-2 items-center w-full">
        <div
          className={classnames(
            "w-full h-full bg-[#ff90ee] border-r border-black dark:border-white px-8 py-1 text-5xl inline-flex items-center",
            fraunces.className
          )}
        >
          Docket is your document-reading assistant.
        </div>
        <div className="bg-[#ffc900] h-full flex flex-row justify-center items-center">
          <SignUp />;
        </div>
      </div>
    </main>
  );
}
