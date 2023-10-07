import Link from "next/link";
import Header from "./header";

export default function Page() {
  return (
    <main className="h-screen flex flex-col items-center justify-center space-y-4">
      <Header />
      <span className="text-5xl tracking-wide">Docket</span>
      <span className="text-2xl">Save highlights for doc site</span>
      <div className="flex flex-row space-x-4">
        <a href="" className="border-2 px-4 py-2 border-yellow-200">
          Chrome Extension
        </a>
        <Link
          href="/home"
          className="border-2 py-2 px-4 border-yellow-200"
        >
          My Docket
        </Link>
      </div>
    </main>
  );
}
