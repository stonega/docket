import { forwardRef, RefObject } from "react";
import classnames from "classnames";
import Link from "next/link";
import LoadingCircle from "./loading-circle";

type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps {
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  outlined?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => any;
  ref?: RefObject<any> | ((instance: any) => void) | null | undefined;
}

const Button = forwardRef(function Button(
  {
    size = "md",
    children,
    type,
    disabled,
    className,
    onClick,
    href,
    loading = false,
    outlined = false,
  }: ButtonProps,
  buttonRef,
) {
  let sizeClassName: string = "";
  switch (size) {
    case "lg":
      sizeClassName = "p-3 text-xl";
      break;
    case "md":
      sizeClassName = "p-2 text-md";
      break;
    case "sm":
      sizeClassName = "p-1 text-sm";
      break;
  }
  const basicClassName =
    "relative transition-ease flex flex-row space-x-2 items-center text-black whitespace-nowrap hover:text-black w-auto font-bold text-center active:border-transparent outline-yellow-500 active:outline active:outline-2 active:outline-offset-2";
  const props = {
    onClick,
    type,
    disabled,
    ref: buttonRef as React.RefObject<any>,
  };
  if (href)
    return (
      <Link href={href}>
        <a
          {...props}
          className={classnames(
            basicClassName,
            sizeClassName,
            className,
          )}
        >
          {children}
        </a>
      </Link>
    );
  return (
    <button
      {...props}
      className={classnames(
        basicClassName,
        sizeClassName,
        {
          "bg-yellow-500 border-none": !outlined,
          "border-2 border-yellow-400 bg-yellow-200 dark:bg-yellow-600": outlined,
        },
        className,
      )}
    >
      <span>{children}</span>
      {loading && <LoadingCircle />}
    </button>
  );
});

export default Button;
