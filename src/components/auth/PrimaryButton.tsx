import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "w-full h-13 min-h-[52px] rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold tracking-wide transition active:scale-[0.98] hover:bg-primary/95 disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
