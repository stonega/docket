import "./globals.css";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
import { Toaster } from "sonner";
import { geist } from "./fonts";

export const metadata: Metadata = {
  title: "Docket",
  description: "Pocket for docs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (await getCloudflareContext({ async: true })).env
      .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/home"
      appearance={{
        variables: {
          colorPrimary: "#eab308",
        },
        elements: {
          userButtonPopoverCard: "rounded-none",
          card: "rounded-none shadow-md",
          scrollBox: "rounded-none",
        },
      }}
    >
      <html lang="en">
        <body
          className={cl(geist.className, "bg-white dark:bg-[#111]")}
        >
          <Toaster
            position="top-center"
            richColors={true}
            toastOptions={{
              className: "border-2 border-yellow-300 dark:border-yellow-700",
            }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
