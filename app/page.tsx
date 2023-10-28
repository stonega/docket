import Link from "next/link";
import Header from "./header";

export default function Page() {
  return (
    <main className="h-screen flex flex-col items-center justify-center">
      <Header />
      <span className="text-6xl ">
        Organize your highlight docs, Save highlights for doc site.
      </span>
      <div className="flex flex-row space-x-4 mt-20">
        <a
          href=""
          className="border-2 px-4 py-2 border-yellow-300 font-bold hover:bg-yellow-100"
        >
          Chrome Extension
        </a>
        <Link
          href="/home"
          className="border-2 py-2 px-4 border-yellow-300 font-bold hover:bg-yellow-100"
        >
          My Docket
        </Link>
      </div>
    </main>
  );
}
