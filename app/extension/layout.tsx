import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect Extension",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
