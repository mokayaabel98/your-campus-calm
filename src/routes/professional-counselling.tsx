import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, Monitor, MapPin, ShieldCheck, Wallet } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/professional-counselling")({
  head: () => ({
    meta: [
      { title: "Professional Counselling for Students — Willow" },
      {
        name: "description",
        content:
          "Book 50-minute sessions with qualified counsellors and psychologists. Online or in person, with subsidised and university-sponsored options.",
      },
      { property: "og:title", content: "Professional Counselling for Students — Willow" },
      {
        property: "og:description",
        content:
          "Qualified, supervised counsellors. Online or in person. Subsidised fees and financial assistance available.",
      },
    ],
  }),
  component: ProfessionalPage,
});

const steps = [
  {
    title: "Create a private account",
    body: "We only ask for what we need: a contact email, your institution and a display name.",
  },
  {
    title: "Choose a counsellor and a time",
    body: "Browse qualifications and areas of support, then pick a slot that fits around lectures.",
  },
  {
    title: "Confirm and attend",
    body: "You get a secure confirmation with joining details. Reschedule or cancel any time up to 12 hours before.",
  },
];

const counsellors = [
  {
    name: "Dr. A. Wanjiru",
    credential: "PhD Clinical Psychology · Registered Psychologist",
    focus: ["Anxiety", "Trauma", "Academic pressure"],
    mode: "Online & in person",
    availability: "Mon–Thu, afternoons",
  },
  {
    name: "M. Otieno",
    credential: "MSc Counselling Psychology · Licensed Counsellor",
    focus: ["Depression", "Bereavement", "Identity"],
    mode: "Online",
    availability: "Tue–Sat, evenings",
  },
  {
    name: "S. Kimani",
    credential: "MA Counselling · Licensed Counsellor",
    focus: ["Relationships", "Burnout", "Substance use"],
    mode: "In person, Campus Wellbeing Centre",
    availability: "Mon–Fri, mornings",
  },
];

const pricing = [
  {
    label: "University-sponsored",
    price: "Free",
    body: "Where your institution funds student counselling. We verify eligibility privately.",
  },
  {
    label: "Subsidised session",
    price: "KSh 500",
    body: "Reduced rate for enrolled students, up to six sessions per semester.",
  },
  {
    label: "Standard session",
    price: "KSh 1,500",
    body: "Pay per 50-minute session. Packages of four are available at a lower rate.",
  },
];

function ProfessionalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Licensed & supervised"
        title="Professional counselling, on your terms"
        intro="Qualified counsellors and psychologists who work with students every day. Sessions are 50 minutes, online or in person, and everything you share is confidential."
      >
        <Button asChild variant="brand" size="pill-lg">
          <Link to="/book">Book a Session</Link>
        </Button>
        <Button asChild variant="soft" size="pill-lg">
          <Link to="/privacy">How we protect your privacy</Link>
        </Button>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-semibold leading-tight text-balance">How to get started</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-card p-6 ring-1 ring-border">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary-deep">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-[52ch]">
            <h2 className="text-3xl font-semibold leading-tight text-balance">Our counsellors</h2>
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              Every counsellor is registered, vetted and clinically supervised. Profiles show
              qualifications and areas of support only — no personal contact details.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {counsellors.map((c) => (
              <article key={c.name} className="rounded-3xl bg-card p-6 ring-1 ring-border">
                <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary-deep">
                  <ShieldCheck className="size-5" />
                </span>
                <h3 className="mt-4 text-xl font-medium">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.credential}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.focus.map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <dl className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Monitor className="size-4 shrink-0" />
                    <dd>{c.mode}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" />
                    <dd>{c.availability}</dd>
                  </div>
                </dl>
                <Button asChild variant="soft" size="pill" className="mt-6 w-full">
                  <Link to="/book">Request a session</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-[52ch]">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            Session length and fees
          </h2>
          <p className="mt-3 text-base text-muted-foreground text-pretty">
            Every session is 50 minutes. You always see the price before you confirm anything, and
            payment happens through a secure gateway — we never store your card details.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pricing.map((p) => (
            <div key={p.label} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <span className="grid size-10 place-items-center rounded-full bg-accent/15 text-primary-deep">
                <Wallet className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium">{p.label}</h3>
              <p className="mt-1 font-display text-2xl font-semibold text-primary-deep">
                {p.price}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-sand/70 p-6 ring-1 ring-border">
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            <strong className="font-medium text-foreground">
              Cost should never be the reason you don&rsquo;t come.
            </strong>{" "}
            You can request financial assistance during booking — it is reviewed privately and never
            shown to your counsellor.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-sand/50">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 sm:grid-cols-2">
          <div className="flex gap-4 rounded-2xl bg-card p-6 ring-1 ring-border">
            <Monitor className="size-5 shrink-0 text-primary-deep" />
            <div>
              <h3 className="text-lg font-medium">Online sessions</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Join from a private space over an encrypted video link. Camera off is completely
                fine.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-2xl bg-card p-6 ring-1 ring-border">
            <MapPin className="size-5 shrink-0 text-primary-deep" />
            <div>
              <h3 className="text-lg font-medium">In-person sessions</h3>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Quiet, private rooms at the Campus Wellbeing Centre, Gate 4. No reception queue.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-14">
          <Button asChild variant="brand" size="pill-lg">
            <Link to="/book">
              <CalendarCheck className="size-4" /> Book a Session
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
