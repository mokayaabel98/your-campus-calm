import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, GraduationCap, HeartHandshake, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Willow — Our Mission for Student Wellbeing" },
      {
        name: "description",
        content:
          "Why Willow exists: a safe, accessible support system for students, with trained, supervised counsellors and a firm commitment to confidentiality.",
      },
      { property: "og:title", content: "About Willow — Our Mission for Student Wellbeing" },
      {
        property: "og:description",
        content:
          "A safe, accessible support system for students, built on training, supervision and confidentiality.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Compass,
    title: "Our mission",
    body: "To make asking for help the easiest thing a student does all week — private, affordable and free of judgement.",
  },
  {
    icon: HeartHandshake,
    title: "Our vision",
    body: "A campus where wellbeing support is as ordinary and available as the library, and where no student carries things alone.",
  },
  {
    icon: GraduationCap,
    title: "Training & supervision",
    body: "Counsellors are registered and clinically supervised. Peer counsellors complete accredited listening, safeguarding and confidentiality training and meet a supervisor regularly.",
  },
  {
    icon: ShieldCheck,
    title: "How we behave",
    body: "Confidential by default, respectful always, and honest about our limits. We tell you what we can and cannot do before you share anything.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A digital wellbeing centre, built around student dignity"
        intro="Willow began with a simple observation: students often know they need to talk long before they feel able to walk into an office. So we built a door that is easier to open — and just as private once it closes."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary-deep">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-2xl font-medium">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            The promises we hold ourselves to
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "We collect the least information we can, and delete it when it is no longer needed.",
              "We never publish student names, appointments or conversations.",
              "We explain confidentiality — and its limits — in plain language before you share.",
              "We keep a route to support open even if you cannot pay.",
            ].map((p) => (
              <li key={p} className="rounded-2xl bg-card p-5 text-sm leading-relaxed ring-1 ring-border">
                {p}
              </li>
            ))}
          </ul>
          <Button asChild variant="soft" size="pill-lg" className="mt-8">
            <Link to="/privacy">Read our privacy commitment</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
