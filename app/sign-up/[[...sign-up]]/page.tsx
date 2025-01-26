import { fraunces } from "@/app/fonts";
import Header from "@/app/header";
import { SignUp } from "@clerk/nextjs";
import classnames from "classnames";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <div className="grow grid grid-cols-1 md:grid-cols-2 items-center">
        <div
          className={classnames(
            "mx-auto w-60 text-5xl font-serif dark:text-white text-center",
            fraunces.className
          )}
        >
          Docket is your document-reading assistant.
        </div>
        <div className="flex flex-row justify-center items-center">
          <SignUp />;
        </div>
      </div>
    </main>
  );
}
