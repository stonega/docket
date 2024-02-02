import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
import { Toaster } from "sonner";
import { inter } from "./fonts";

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
      appearance={{
        variables: {
          colorPrimary: "#eab308",
        },
        elements: {
          userButtonPopoverCard: "rounded-none shadow-md",
          card: "rounded-none shadow-md",
          scrollBox: "rounded-none",
        },
      }}
    >
      <html lang="en">
        <body
          className={cl(inter.className, "bg-yellow-50 dark:bg-gray-900")}
        >
          <Toaster
            position="top-center"
            closeButton={true}
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
