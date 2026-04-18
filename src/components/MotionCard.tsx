import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  /** Delay (s) for stagger entrance */
  delay?: number;
  /** Disable entrance animation (e.g. when parent already animates) */
  noEntrance?: boolean;
  /** Lift intensity on hover */
  lift?: "subtle" | "medium" | "strong";
}

const liftMap = {
  subtle: { y: -3, scale: 1.005 },
  medium: { y: -6, scale: 1.012 },
  strong: { y: -10, scale: 1.02 },
} as const;

const shadowMap = {
  subtle: "0 12px 30px -15px hsl(var(--primary) / 0.18)",
  medium: "0 22px 50px -20px hsl(var(--primary) / 0.25)",
  strong: "0 30px 70px -25px hsl(var(--primary) / 0.32)",
};

/**
 * Card wrapper with soft framer-motion hover micro-animations
 * (slight lift, scale, and primary-tinted shadow).
 * Respects prefers-reduced-motion via framer-motion defaults.
 */
const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, delay = 0, noEntrance = false, lift = "medium", ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={noEntrance ? false : { opacity: 0, y: 14 }}
        whileInView={noEntrance ? undefined : { opacity: 1, y: 0 }}
        viewport={noEntrance ? undefined : { once: true, margin: "-50px" }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{
          ...liftMap[lift],
          boxShadow: shadowMap[lift],
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
        className={cn("will-change-transform", className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

export default MotionCard;
