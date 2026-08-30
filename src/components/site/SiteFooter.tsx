import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sand/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-primary font-display text-sm font-semibold leading-none text-primary-foreground">
            W
          </span>
          Willow Student Wellbeing
        </span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy &amp; Confidentiality
          </Link>
          <Link to="/faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
          <Link to="/get-help" className="font-medium text-urgent-foreground">
            Get help now
          </Link>
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-xs text-muted-foreground">
        Willow is not an emergency service. If you or someone else is in immediate danger, contact
        local emergency services straight away.
      </p>
    </footer>
  );
}
