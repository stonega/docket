import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
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
        elements: {
          userButtonPopoverCard: 'rounded-none shadow-md',
          card: 'rounded-none shadow-md',
          scrollBox: 'rounded-none',
        },
      }}
    >
      <html lang="en">
        <body
          className={cl(inter.className, "bg-yellow-50 dark:bg-yellow-950")}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
