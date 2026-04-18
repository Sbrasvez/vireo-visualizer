import { cn } from "@/lib/utils";

/**
 * Editorial skeleton system — soft shimmer, palette-safe.
 * Pairs with Tactile Market eyebrow/serif language.
 *
 * <SkeletonShimmer /> base block (animated gradient sweep).
 * <SkeletonEyebrow /> mono-style placeholder for "— EYEBROW" labels.
 * <SkeletonProductCard /> editorial product card placeholder.
 * <SkeletonProductDetail /> full product page placeholder.
 * <SkeletonRecipeDetail /> full recipe page placeholder.
 */

export function SkeletonShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60",
        // Soft shimmer sweep (palette-safe; uses card token over muted base)
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-[linear-gradient(90deg,transparent,hsl(var(--card)/0.55),transparent)]",
        "before:bg-[length:200%_100%] before:animate-shimmer",
        className,
      )}
    />
  );
}

export function SkeletonEyebrow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground/60">—</span>
      <SkeletonShimmer className="h-2.5 w-28 rounded-full" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Marketplace product card                          */
/* -------------------------------------------------------------------------- */

export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <SkeletonShimmer className="aspect-[4/5] w-full rounded-xl" />
      <div className="space-y-2 px-0.5">
        <SkeletonEyebrow />
        <SkeletonShimmer className="h-5 w-3/4 rounded" />
        <SkeletonShimmer className="h-7 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Restaurant card                                 */
/* -------------------------------------------------------------------------- */

export function SkeletonRestaurantCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card overflow-hidden",
        className,
      )}
    >
      <SkeletonShimmer className="aspect-[16/10] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <SkeletonShimmer className="h-5 w-2/3 rounded" />
          <SkeletonShimmer className="h-4 w-10 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonShimmer className="h-3 w-12 rounded-full" />
          <SkeletonShimmer className="h-3 w-20 rounded-full" />
        </div>
        <div className="space-y-1.5 pt-1">
          <SkeletonShimmer className="h-3 w-full rounded" />
          <SkeletonShimmer className="h-3 w-9/12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRestaurantGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRestaurantCard key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Magic Bag card                                */
/* -------------------------------------------------------------------------- */

export function SkeletonMagicBagCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col",
        className,
      )}
    >
      <div className="relative">
        <SkeletonShimmer className="aspect-[4/3] w-full rounded-none" />
        {/* Discount chip placeholder */}
        <div className="absolute top-3 left-3">
          <SkeletonShimmer className="h-6 w-14 rounded-full" />
        </div>
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <SkeletonEyebrow />
        <SkeletonShimmer className="h-5 w-4/5 rounded" />
        <SkeletonShimmer className="h-3 w-3/5 rounded" />
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/40">
          <div className="space-y-1.5">
            <SkeletonShimmer className="h-3 w-16 rounded-full" />
            <SkeletonShimmer className="h-6 w-20 rounded" />
          </div>
          <SkeletonShimmer className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMagicBagGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMagicBagCard key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Community post                                */
/* -------------------------------------------------------------------------- */

export function SkeletonCommunityPost({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-5 sm:p-6 space-y-4",
        className,
      )}
    >
      {/* Author row */}
      <div className="flex items-center gap-3">
        <SkeletonShimmer className="size-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <SkeletonShimmer className="h-3 w-32 rounded" />
          <SkeletonShimmer className="h-2.5 w-20 rounded-full" />
        </div>
      </div>

      {/* Title + body */}
      <div className="space-y-2.5">
        <SkeletonShimmer className="h-6 w-4/5 rounded" />
        <div className="space-y-1.5">
          <SkeletonShimmer className="h-3 w-full rounded" />
          <SkeletonShimmer className="h-3 w-11/12 rounded" />
          <SkeletonShimmer className="h-3 w-9/12 rounded" />
        </div>
      </div>

      {/* Optional image */}
      <SkeletonShimmer className="aspect-[16/9] w-full rounded-xl" />

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/40">
        <SkeletonShimmer className="h-7 w-16 rounded-full" />
        <SkeletonShimmer className="h-7 w-16 rounded-full" />
        <SkeletonShimmer className="h-7 w-20 rounded-full ml-auto" />
      </div>
    </article>
  );
}

export function SkeletonCommunityList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCommunityPost key={i} />
      ))}
    </div>
  );
}
/*                              Product Detail                                */
/* -------------------------------------------------------------------------- */

export function SkeletonProductDetail() {
  return (
    <div className="container max-w-6xl py-10 space-y-12">
      {/* Breadcrumb stub */}
      <div className="flex items-center gap-2">
        <SkeletonShimmer className="h-3 w-16 rounded-full" />
        <span className="text-muted-foreground/40">/</span>
        <SkeletonShimmer className="h-3 w-24 rounded-full" />
        <span className="text-muted-foreground/40">/</span>
        <SkeletonShimmer className="h-3 w-32 rounded-full" />
      </div>

      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
        {/* Gallery */}
        <div className="space-y-4">
          <SkeletonShimmer className="aspect-square w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonShimmer key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Right column: meta + buy */}
        <div className="space-y-6">
          <SkeletonEyebrow />
          <div className="space-y-3">
            <SkeletonShimmer className="h-10 w-11/12 rounded" />
            <SkeletonShimmer className="h-10 w-7/12 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonShimmer className="h-4 w-24 rounded-full" />
            <SkeletonShimmer className="h-4 w-16 rounded-full" />
          </div>
          <SkeletonShimmer className="h-12 w-1/3 rounded" />
          <div className="space-y-2 pt-2">
            <SkeletonShimmer className="h-3 w-full rounded" />
            <SkeletonShimmer className="h-3 w-11/12 rounded" />
            <SkeletonShimmer className="h-3 w-9/12 rounded" />
          </div>
          <div className="flex gap-3 pt-4">
            <SkeletonShimmer className="h-12 flex-1 rounded-full" />
            <SkeletonShimmer className="h-12 w-12 rounded-full" />
          </div>
          <div className="border-t border-border/50 pt-5 space-y-3">
            <SkeletonEyebrow />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonShimmer className="h-14 rounded-lg" />
              <SkeletonShimmer className="h-14 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Description block */}
      <section className="space-y-4 pt-6 border-t border-border/40">
        <SkeletonEyebrow />
        <SkeletonShimmer className="h-7 w-1/2 rounded" />
        <div className="space-y-2 max-w-3xl">
          <SkeletonShimmer className="h-3 w-full rounded" />
          <SkeletonShimmer className="h-3 w-11/12 rounded" />
          <SkeletonShimmer className="h-3 w-10/12 rounded" />
          <SkeletonShimmer className="h-3 w-8/12 rounded" />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Recipe Detail                                 */
/* -------------------------------------------------------------------------- */

export function SkeletonRecipeDetail() {
  return (
    <div className="container max-w-6xl py-10 space-y-10">
      {/* Breadcrumb stub */}
      <div className="flex items-center gap-2">
        <SkeletonShimmer className="h-3 w-16 rounded-full" />
        <span className="text-muted-foreground/40">/</span>
        <SkeletonShimmer className="h-3 w-28 rounded-full" />
      </div>

      {/* Hero header */}
      <header className="space-y-5">
        <SkeletonEyebrow />
        <div className="space-y-3 max-w-3xl">
          <SkeletonShimmer className="h-12 sm:h-14 w-11/12 rounded" />
          <SkeletonShimmer className="h-12 sm:h-14 w-7/12 rounded" />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonShimmer key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </header>

      {/* Cover */}
      <SkeletonShimmer className="aspect-[16/8] w-full rounded-3xl" />

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-4 space-y-2"
          >
            <SkeletonShimmer className="h-3 w-20 rounded-full" />
            <SkeletonShimmer className="h-7 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Ingredients + Steps */}
      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        <aside className="lg:col-span-1 space-y-4 rounded-2xl border border-border/50 bg-card p-6">
          <SkeletonEyebrow />
          <SkeletonShimmer className="h-6 w-2/3 rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonShimmer className="size-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonShimmer className="h-3 w-3/4 rounded" />
                  <SkeletonShimmer className="h-2.5 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
          <SkeletonShimmer className="h-11 w-full rounded-full mt-2" />
        </aside>

        <section className="lg:col-span-2 space-y-5 rounded-2xl border border-border/50 bg-card p-6">
          <SkeletonEyebrow />
          <SkeletonShimmer className="h-6 w-1/2 rounded" />
          <div className="space-y-5 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <SkeletonShimmer className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonShimmer className="h-3 w-full rounded" />
                  <SkeletonShimmer className="h-3 w-11/12 rounded" />
                  <SkeletonShimmer className="h-3 w-9/12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
