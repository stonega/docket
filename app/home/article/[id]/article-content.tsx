"use client";

import { useEffect, useRef } from "react";

export default function ArticleContent({ html }: { html: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = Array.from(root.current?.querySelectorAll("img, audio, video") ?? []);
    const cleanups = media.map((element) => {
      const handleError = () => {
        if (element.nextElementSibling?.getAttribute("data-article-media-fallback") === "true") {
          return;
        }
        element.setAttribute("hidden", "");
        const fallback = document.createElement("p");
        fallback.dataset.articleMediaFallback = "true";
        fallback.className = "article-media-fallback";
        fallback.textContent = "Remote media is unavailable. The saved text remains readable.";
        element.insertAdjacentElement("afterend", fallback);
      };
      element.addEventListener("error", handleError);
      if (
        element instanceof HTMLImageElement &&
        element.complete &&
        element.naturalWidth === 0
      ) {
        handleError();
      }
      return () => element.removeEventListener("error", handleError);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [html]);

  return (
    <div
      ref={root}
      className="article-content prose prose-stone max-w-none dark:prose-invert prose-a:text-emerald-700 dark:prose-a:text-emerald-300 prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto sm:prose-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
