import { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export default function Tooltip({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode | string;
  fullWidth?: boolean;
}) {
  return (
    <>
      <TooltipPrimitive.Provider delayDuration={100}>
        <TooltipPrimitive.Root>
          <TooltipPrimitive.Trigger className="hidden sm:inline-flex" asChild>
            {children}
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              sideOffset={2}
              side="top"
              className="z-30 hidden animate-slide-up-fade items-center overflow-hidden rounded-md bg-black/80 drop-shadow-lg sm:block"
            >
              {typeof content === "string" ? (
                <div className="p-2">
                  <span className="block max-w-xs text-center text-sm text-white">
                    {content}
                  </span>
                </div>
              ) : (
                content
              )}
              <TooltipPrimitive.Arrow
                className="fill-black/80"
                width={11}
                height={5}
              />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    </>
  );
}
