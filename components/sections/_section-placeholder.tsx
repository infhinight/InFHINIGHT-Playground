import { cn } from "@/lib/utils";

interface SectionPlaceholderProps {
  label: string;
  className?: string;
}

/**
 * Visual stand-in for a section's content. Remove once real
 * copy/UI is built for the section that renders this.
 */
export function SectionPlaceholder({ label, className }: SectionPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[14rem] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground",
        className
      )}
    >
      {label}
    </div>
  );
}
