import { Link } from "@tanstack/react-router";

export function UrgentBar() {
  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-1.5 shrink-0 rounded-full bg-urgent" />
          <span className="hidden sm:inline">Struggling right now? You are not alone.</span>
          <span className="sm:hidden">Need help now?</span>
        </p>
        <Link
          to="/get-help"
          className="inline-flex shrink-0 items-center rounded-full bg-urgent-soft px-4 py-2 text-sm font-semibold text-urgent-foreground ring-1 ring-urgent/40 transition-transform hover:-translate-y-px"
        >
          Get Help Now
        </Link>
      </div>
    </div>
  );
}
