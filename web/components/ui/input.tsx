import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "border-line bg-input-bg text-ink placeholder:text-muted h-10 w-full rounded-md border px-3 text-sm transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
          className,
        )}
        {...props}
      />
    );
  },
);
