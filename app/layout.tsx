import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
import Header from "./header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Docspocket",
  description: "Docs pocket",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cl(inter.className, "bg-yellow-100 dark:bg-yellow-950")}>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
