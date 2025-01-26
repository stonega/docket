import { fraunces } from "@/app/fonts";
import Header from "@/app/header";
import { SignIn } from "@clerk/nextjs";
import classnames from "classnames";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <div className="grow grid grid-cols-1 md:grid-cols-2 items-center justify-center">
        <div
          className={classnames(
            "px-8 text-5xl font-serif dark:text-white text-center font-semibold",
            fraunces.className
          )}
        >
          Docket is your document-reading assistant.
        </div>
        <div className="flex flex-row justify-center items-center">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
