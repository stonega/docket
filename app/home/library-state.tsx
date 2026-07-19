import classnames from "classnames";

type LibraryStateVariant = "sites" | "excerpts" | "articles" | "search" | "error";

interface LibraryStateProps {
  title: string;
  description: string;
  variant?: LibraryStateVariant;
}

export default function LibraryState({
  title,
  description,
  variant = "sites",
}: LibraryStateProps) {
  return (
    <div
      className={classnames(
        "library-enter flex min-h-60 w-full flex-col items-center justify-center border border-dashed px-6 py-12 text-center",
        {
          "border-sites-300 bg-sites-50/80 dark:border-sites-800 dark:bg-sites-950/30":
            variant === "sites",
          "border-excerpts-300 bg-excerpts-50/80 dark:border-excerpts-800 dark:bg-excerpts-950/30":
            variant === "excerpts" || variant === "search",
          "border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30":
            variant === "articles",
          "border-yellow-400 bg-yellow-50/80 dark:border-yellow-700 dark:bg-yellow-950/20":
            variant === "error",
        },
      )}
      role={variant === "error" ? "alert" : undefined}
    >
      <span
        aria-hidden="true"
        className={classnames(
          "mb-5 flex size-11 items-center justify-center rounded-full border bg-white shadow-sm dark:bg-white/10",
          {
            "border-sites-300": variant === "sites",
            "border-excerpts-300":
              variant === "excerpts" || variant === "search",
            "border-emerald-300": variant === "articles",
            "border-yellow-400": variant === "error",
          },
        )}
      >
        <span
          className={classnames("size-2.5 rounded-full", {
            "bg-sites-500": variant === "sites",
            "bg-excerpts-500":
              variant === "excerpts" || variant === "search",
            "bg-emerald-500": variant === "articles",
            "bg-yellow-500": variant === "error",
          })}
        />
      </span>
      <h2 className="text-base font-semibold tracking-tight text-stone-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
        {description}
      </p>
    </div>
  );
}
