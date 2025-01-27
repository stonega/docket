"use client";
import classnames from "classnames";

export default function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={classnames("w-full px-4 md:px-0 relative grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3")}
    >
      {children}
    </div>
  );
}
