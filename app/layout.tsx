import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
import Header from "./header";
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
    <ClerkProvider>
      <html lang="en">
        <body
          className={cl(inter.className, "bg-yellow-50 dark:bg-yellow-950")}
        >
          <Header />
          <div className="pt-16">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
