import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Tombol dasar. Varian `primary` memakai gradien merah→maroon Tel-U (kontras teks putih ≥ 4.5:1). */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-telu-maroon text-white shadow-lg shadow-telu-red/20 hover:bg-telu-red-700 bg-[linear-gradient(135deg,#d81c25,#b6252a)] hover:brightness-110",
        secondary: "bg-foreground text-background hover:opacity-90",
        outline: "border border-border bg-background hover:border-telu-red/50 hover:text-primary",
        ghost: "hover:bg-muted",
        subtle: "bg-telu-red-50 text-telu-maroon hover:bg-telu-red-100 dark:bg-telu-red/15 dark:text-primary",
        link: "text-primary underline-offset-4 hover:underline px-0",
        glass: "glass-on-color border border-white/30 text-white hover:bg-white/20",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
        {asChild ? children : (
          <>
            {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
