import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  HeartHandshake,
  LifeBuoy,
  Moon,
  Sparkles,
  Sprout,
  Stethoscope,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Mental Health Resources for Students — Willow" },
      {
        name: "description",
        content:
          "Guides on stress, anxiety, relationships, bereavement, burnout and self-care, plus how to know when it is time to seek professional help.",
      },
      { property: "og:title", content: "Mental Health Resources for Students" },
      {
        property: "og:description",
        content:
          "Short, honest guides on stress, anxiety, relationships, grief, burnout and coping — free and with no sign-up.",
      },
    ],
  }),
  component: ResourcesPage,
});

const topics = [
  {
    icon: Sparkles,
    title: "Stress & academic pressure",
    body: "Why deadlines hijack your body, and small practical ways to bring the volume back down during exam season.",
  },
  {
    icon: Moon,
    title: "Anxiety & emotional wellbeing",
    body: "What anxiety actually is, grounding techniques that work in a lecture hall, and how to stop avoidance growing.",
  },
  {
    icon: Users,
    title: "Relationships & social challenges",
    body: "Making friends late, roommate conflict, breakups, and boundaries that leave you feeling respected.",
  },
  {
    icon: HeartHandshake,
    title: "Bereavement & difficult life events",
    body: "Grieving while studying, telling your department, and what to expect in the weeks and months after a loss.",
  },
  {
    icon: Sprout,
    title: "Academic burnout",
    body: "The difference between tired and burnt out, the early signs, and how to recover without falling behind.",
  },
  {
    icon: BookOpen,
    title: "Self-care & healthy coping",
    body: "Sleep, food, movement and money — the unglamorous basics that carry most of the weight.",
  },
];

const emergency = [
  { label: "Kenya Red Cross emotional support", detail: "1199 · free, 24 hours" },
  { label: "Befrienders Kenya", detail: "+254 722 178 177" },
  { label: "Emergency services", detail: "999 / 112" },
  { label: "Campus Wellbeing Centre", detail: "Gate 4 · Mon–Fri, 8am–6pm" },
];

function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free to read, no sign-up"
        title="Mental health resources for student life"
        intro="Reading something is a legitimate first step. These guides are short, honest and written for the realities of campus — not a clinic waiting room."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ icon: Icon, title, body }, i) => (
            <article
              key={title}
              className="rounded-2xl bg-card p-6 ring-1 ring-border transition-transform hover:-translate-y-0.5"
            >
              <span
                className={`grid size-10 place-items-center rounded-full text-primary-deep ${
                  i % 2 === 0 ? "bg-primary/10" : "bg-accent/15"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary-deep">
              <Stethoscope className="size-5" />
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-balance">
              When to seek professional help
            </h2>
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              Reach out to a professional if any of these have lasted more than two weeks, or if
              they are getting in the way of your day.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              <li>— You cannot sleep, or you cannot get out of bed.</li>
              <li>— Things you used to enjoy feel flat or pointless.</li>
              <li>— You are using alcohol or substances to cope.</li>
              <li>— Panic, dread or low mood is showing up most days.</li>
              <li>— You are having thoughts of harming yourself.</li>
            </ul>
            <Button asChild variant="brand" size="pill-lg" className="mt-7">
              <Link to="/book">Book a Session</Link>
            </Button>
          </div>

          <div className="rounded-3xl bg-urgent-soft p-7 ring-1 ring-urgent/30">
            <div className="flex items-center gap-2.5 text-urgent-foreground">
              <LifeBuoy className="size-5" />
              <h2 className="text-2xl font-medium">Emergency & professional services</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {emergency.map((e) => (
                <li key={e.label} className="rounded-2xl bg-card p-4 ring-1 ring-border">
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{e.detail}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/get-help"
              className="mt-5 inline-flex text-sm font-semibold text-urgent-foreground underline underline-offset-4"
            >
              See all urgent support options &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
