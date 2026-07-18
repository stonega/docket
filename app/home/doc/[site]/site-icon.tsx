"use client";

import Image from "next/image";
import { useState } from "react";

interface SiteIconProps {
  icon: string;
  title: string;
}

export default function SiteIcon({ icon, title }: SiteIconProps) {
  const [imageError, setImageError] = useState(false);
  const initial = title.trim().charAt(0).toUpperCase() || "D";
  const hasImage = Boolean(icon) && !imageError;

  return (
    <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sites-200 bg-white shadow-[0_8px_24px_rgba(64,34,24,0.08)] dark:border-sites-800 dark:bg-white/10 sm:size-20">
      {hasImage ? (
        <Image
          alt=""
          src={icon}
          unoptimized
          width={52}
          height={52}
          className="size-12 object-contain sm:size-14"
          onError={() => setImageError(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-full items-center justify-center bg-yellow-200 text-xl font-bold text-stone-800 dark:bg-yellow-800 dark:text-yellow-50 sm:text-2xl"
        >
          {initial}
        </span>
      )}
    </span>
  );
}
