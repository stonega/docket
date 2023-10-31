import { playfair } from "@/app/fonts";
import { SignIn } from "@clerk/nextjs";
import classnames from "classnames";

export default function Page() {
  return (
    <div className="h-[100vh] grid grid-cols-1 md:grid-cols-2 items-center">
      <div
        className={classnames(
          "text-6xl font-semibold font-serif dark:text-white text-center tracking-wide",
          playfair.variable
        )}
      >
        Organize your highlight docs.
      </div>
      <div className="flex flex-row justify-center items-center">
        <SignIn />;
      </div>
    </div>
  );
}
