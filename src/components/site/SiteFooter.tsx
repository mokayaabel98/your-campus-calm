import { Link } from "@tanstack/react-router";
import { Clock, Instagram, Linkedin, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/willow-student-wellbeing",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/willowwellbeing",
    icon: Instagram,
  },
  { label: "TikTok", href: "https://www.tiktok.com/@willowwellbeing", icon: Music2 },
  { label: "WhatsApp", href: "https://wa.me/254207640000", icon: MessageCircle },
];

const pages = [
  { to: "/professional-counselling", label: "Professional counselling" },
  { to: "/peer-counselling", label: "Peer counselling" },
  { to: "/resources", label: "Mental health resources" },
  { to: "/book", label: "Book a session" },
  { to: "/about", label: "About us" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary font-display text-base font-semibold leading-none text-primary-foreground">
              W
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Willow</span>
          </span>
          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-muted-foreground text-pretty">
            A safe digital wellbeing centre for university and college students, enabling acess to
            professional counselling and trained peer support, privately and without judgement.
          </p>
          <div className="mt-5 flex gap-2.5">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                title={label}
                className="grid size-10 place-items-center rounded-full bg-card text-muted-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <h2 className="font-display text-base font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-muted-foreground">
            {pages.map((p) => (
              <li key={p.to}>
                <Link to={p.to} className="transition-colors hover:text-foreground">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <h2 className="font-display text-base font-semibold">Contact the centre</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href="mailto:support.campuswell@gmail.com" className="hover:text-foreground">
                support.campuswell@gmail.com
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href="tel:+254207640000" className="hover:text-foreground">
                +254 701203242
              </a>
            </li>
            <li className="flex gap-2.5">
              <MessageCircle className="mt-0.5 size-4 shrink-0" />
              <a
                href="https://wa.me/254207640000"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-foreground"
              >
                WhatsApp +254 701203242
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                Campus Wellbeing Centre, Gate 4
                <br />
                off Nyeri-Mweiga Road, Kenya
              </span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span>
                Mon–Fri 8:00–18:00 · Sat 9:00–13:00
                <br />
                Closed Sundays &amp; public holidays
                <br />
                Online support available 24/7
              </span>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h2 className="font-display text-base font-semibold text-urgent-foreground">
            Urgent support
          </h2>
          <ul className="mt-4 space-y-2.5 text-muted-foreground">
            <li>Emergency services · 999 / 112</li>
            <li>Kenya Red Cross · 1199 (free, 24h)</li>
            <li>Befrienders Kenya · +254 722 178 177</li>
          </ul>
          <Link
            to="/get-help"
            className="mt-4 inline-flex rounded-full bg-urgent-soft px-4 py-2 text-sm font-semibold text-urgent-foreground"
          >
            Get help now
          </Link>
          <Link
            to="/privacy"
            className="mt-4 block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Privacy &amp; confidentiality
          </Link>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Willow Student Wellbeing. All rights reserved.</p>
          <p className="max-w-[62ch]">
            Willow is not an emergency service. If you or someone else is in immediate danger,
            contact local emergency services straight away.
          </p>
        </div>
      </div>
    </footer>
  );
}
