import { Link } from "@tanstack/react-router";
import { Menu, LifeBuoy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Home" },
  { to: "/professional-counselling", label: "Professional" },
  { to: "/peer-counselling", label: "Peer" },
  { to: "/resources", label: "Resources" },
  { to: "/privacy", label: "Privacy" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold leading-none text-primary-foreground">
            W
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Willow</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground font-medium" }}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="soft" size="pill" className="hidden sm:inline-flex">
            <Link to="/peer-counselling">Talk to a Peer</Link>
          </Button>
          <Button asChild variant="brand" size="pill">
            <Link to="/book">Book a Session</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[17rem] bg-background">
              <nav className="mt-10 flex flex-col gap-1 px-2">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{ className: "bg-secondary text-foreground" }}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/get-help"
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-urgent-soft px-3 py-2.5 text-sm font-semibold text-urgent-foreground"
                >
                  <LifeBuoy className="size-4" /> Get help now
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
