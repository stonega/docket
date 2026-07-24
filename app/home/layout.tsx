import type { Metadata } from "next";
import HomeShell from "./home-shell";

export const metadata: Metadata = {
  title: "Library",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HomeShell>{children}</HomeShell>;
}
