import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold [&_svg]:size-3", {
  variants: {
    variant: {
      default: "bg-telu-red-50 text-telu-maroon dark:bg-telu-red/15 dark:text-primary",
      solid: "bg-telu-maroon text-white",
      neutral: "bg-muted text-muted-foreground",
      outline: "border border-border text-muted-foreground",
      success: "bg-success/10 text-success dark:text-emerald-300",
      warning: "bg-warning/10 text-warning dark:text-amber-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
