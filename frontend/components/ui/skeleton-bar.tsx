import { cn } from "@/lib/utils";

/**
 * A shimmer bar rendered as a <span> so it is valid *phrasing content* — it can
 * sit inside <p>, <h1>–<h6> and <span> (and flex/grid containers) without the
 * "<div> cannot be a descendant of <p>" hydration error that a <div>-based
 * skeleton triggers. Defaults to display:block (via inline style so it always
 * beats a Tailwind display class) so multi-line bars stack like the old divs;
 * pass style/display to make a bar inline where it sits next to real text.
 */
export function SkeletonBar({ className, style, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      style={{ display: "block", ...style }}
      {...props}
    />
  );
}
