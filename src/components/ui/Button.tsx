import { type ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-white border-accent hover:bg-accent-dim",
  secondary: "bg-transparent text-ink border-line-strong hover:border-ink hover:bg-paper-dim",
  ghost: "bg-transparent text-ink-soft border-transparent hover:text-ink hover:bg-paper-dim",
  danger: "bg-transparent text-brick border-brick/40 hover:bg-brick-soft",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 border font-medium transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    />
  );
});
