import "./globals.css";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import cl from "classnames";
import { Toaster } from "sonner";
import {
  createOpenGraphMetadata,
  createTwitterMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";
import { geist } from "./fonts";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "productivity",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: createOpenGraphMetadata("/"),
  twitter: createTwitterMetadata(),
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
