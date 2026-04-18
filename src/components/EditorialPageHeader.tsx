import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * EditorialPageHeader — Tactile Market language.
 *
 * Layout: mono eyebrow (— LABEL) on the left, optional N°XX on the right,
 * serif display title with an italic accent, optional lead paragraph and
 * an optional aside slot for actions / share cards.
 *
 *   <EditorialPageHeader
 *     eyebrow="I tuoi preferiti"
 *     number="03"
 *     title="Oggetti che"
 *     italic="amerai a lungo"
 *     lead="Una collezione personale di pezzi sostenibili."
 *     aside={<ShareCard />}
 *   />
 *
 * Variants:
 *  - `surface="gradient"` (default) wraps in `gradient-soft` + bottom border.
 *  - `surface="plain"` renders the bare block (use inside an existing hero).
 *
 * Accent color of the italic word follows `accent` ("primary" | "secondary").
 */

export interface EditorialPageHeaderProps {
  eyebrow: string;
  /** Number/issue chip on the top-right (e.g. "01", "02"). Omit to hide. */
  number?: string;
  /** Optional element rendered in place of the N° chip (e.g. a small badge). */
  topRight?: ReactNode;
  /** Plain text before the italic accent. */
  title: string;
  /** Italic / accented part of the title. */
  italic?: string;
  /** Optional plain text after the italic accent. */
  trailing?: string;
  /** Lead paragraph under the title. */
  lead?: string;
  /** Optional aside (Card, actions) shown to the right on md+ screens. */
  aside?: ReactNode;
  /** Visual surface. Defaults to `gradient` (gradient-soft block). */
  surface?: "gradient" | "plain";
  /** Italic accent color. Defaults to `primary`. */
  accent?: "primary" | "secondary";
  /** Container max width. Defaults to `max-w-6xl`. */
  containerClassName?: string;
  /** Heading scale. `display` is the page-level XL serif; `section` is smaller. */
  size?: "display" | "section";
  className?: string;
}

const ACCENT_CLASS: Record<NonNullable<EditorialPageHeaderProps["accent"]>, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
};

const TITLE_CLASS: Record<NonNullable<EditorialPageHeaderProps["size"]>, string> = {
  display:
    "font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]",
  section:
    "font-display text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight",
};

export default function EditorialPageHeader({
  eyebrow,
  number,
  topRight,
  title,
  italic,
  trailing,
  lead,
  aside,
  surface = "gradient",
  accent = "primary",
  containerClassName = "max-w-6xl",
  size = "display",
  className,
}: EditorialPageHeaderProps) {
  const block = (
    <div className={cn("container", containerClassName)}>
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
          — {eyebrow}
        </span>
        {topRight ?? (number && (
          <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            N°{number}
          </span>
        ))}
      </div>

      <div
        className={cn(
          aside ? "flex flex-col md:flex-row md:items-end md:justify-between gap-8" : "",
        )}
      >
        <div className="max-w-2xl">
          <h1 className={cn(TITLE_CLASS[size], "mb-3")}>
            {title}
            {italic && (
              <>
                {" "}
                <em className={cn("italic", ACCENT_CLASS[accent])}>{italic}</em>
              </>
            )}
            {trailing && <span> {trailing}</span>}
          </h1>
          {lead && (
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              {lead}
            </p>
          )}
        </div>
        {aside && <div className="w-full md:w-auto md:min-w-[320px]">{aside}</div>}
      </div>
    </div>
  );

  if (surface === "plain") {
    return <div className={cn(className)}>{block}</div>;
  }

  return (
    <section
      className={cn("gradient-soft py-14 border-b border-border/40", className)}
    >
      {block}
    </section>
  );
}
