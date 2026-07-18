"use client";

import { useState } from "react";

export default function ArticleCover({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex min-h-28 items-center justify-center border-b border-emerald-200 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_65%)] dark:border-emerald-900"
        role="status"
      >
        <span className="text-xs text-emerald-800 dark:text-emerald-300">
          Remote cover unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-hidden border-b border-emerald-200 bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60">
      {/* The publisher hosts this image; Docket sends no referrer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className="max-h-80 w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
