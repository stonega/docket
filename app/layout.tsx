import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
import { Toaster } from "sonner";
import { geist } from "./fonts";

export const metadata: Metadata = {
  title: "Docket",
  description: "Pocket for docs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
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
