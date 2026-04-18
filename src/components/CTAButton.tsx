import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Premium CTA — soft bounce on tap, shimmer sweep on hover.
 * Built on framer-motion + Tailwind, palette-safe (uses semantic tokens only).
 *
 * Usage:
 *   <CTAButton size="lg">Shop now</CTAButton>
 *   <CTAButton asChild><Link to="/x">Go</Link></CTAButton>
 */
const ctaVariants = cva(
  // base
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-wide " +
    "transition-colors will-change-transform " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.55)] " +
          "hover:shadow-[0_18px_40px_-15px_hsl(var(--primary)/0.55)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_8px_24px_-12px_hsl(var(--secondary)/0.55)] " +
          "hover:shadow-[0_18px_40px_-15px_hsl(var(--secondary)/0.55)]",
        outline:
          "border border-foreground/15 bg-background/60 text-foreground " +
          "hover:bg-vireo-cream/60 hover:border-foreground/25",
        ghost: "bg-transparent text-foreground hover:bg-foreground/5",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-6 text-sm [&_svg]:size-4",
        lg: "h-12 px-8 text-base [&_svg]:size-4",
        xl: "h-14 px-10 text-base [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  }
);

type CTABaseProps = VariantProps<typeof ctaVariants> & {
  asChild?: boolean;
  /** Disable shimmer sweep (e.g. on solid backgrounds where it clashes) */
  noShimmer?: boolean;
  className?: string;
  children?: ReactNode;
};

type CTAButtonProps = CTABaseProps &
  Omit<HTMLMotionProps<"button">, "children" | keyof CTABaseProps>;

const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  (
    { className, variant, size, asChild = false, noShimmer = false, children, ...rest },
    ref
  ) => {
    const showShimmer = !noShimmer && (variant === "primary" || variant === "secondary" || variant == null);

    const motionProps: HTMLMotionProps<"button"> = {
      whileHover: { y: -2, scale: 1.02 },
      whileTap: { scale: 0.96, y: 0 },
      transition: { type: "spring", stiffness: 380, damping: 22, mass: 0.6 },
    };

    if (asChild) {
      // Render Slot child but keep motion behaviour by wrapping outer div instead.
      return (
        <motion.span
          {...motionProps}
          className={cn("inline-block", className?.includes("w-full") && "w-full")}
        >
          <Slot
            ref={ref as never}
            className={cn(ctaVariants({ variant, size }), "relative", className)}
            {...(rest as object)}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {children}
            </span>
          </Slot>
          {/* Shimmer for asChild lives outside Slot — handled via CSS hover on parent group */}
        </motion.span>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(ctaVariants({ variant, size }), "group/cta", className)}
        {...motionProps}
        {...rest}
      >
        {showShimmer && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);
CTAButton.displayName = "CTAButton";

export default CTAButton;
