import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  HeartHandshake,
  LifeBuoy,
  Lock,
  MessageCircleHeart,
  Moon,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";

import calmCorner from "@/assets/calm-corner.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Willow — A Safe Space to Talk, Be Heard and Get Support" },
      {
        name: "description",
        content:
          "Confidential professional counselling and free trained peer support for university and college students. Book online or in person, at your pace.",
      },
      { property: "og:title", content: "Willow — A Safe Space to Talk and Be Heard" },
      {
        property: "og:description",
        content:
          "Confidential counselling and free peer support for students. Private, respectful, non-judgmental.",
      },
    ],
  }),
  component: Home,
});

const resources = [
  {
    icon: Sparkles,
    title: "Stress & academic pressure",
    body: "Small ways to steady your breath between deadlines and exams.",
  },
  {
    icon: Moon,
    title: "Anxiety & emotional wellbeing",
    body: "Understanding the waves, and what actually helps them pass.",
  },
  {
    icon: Users,
    title: "Relationships & friendships",
    body: "Setting boundaries that leave you feeling respected, not guilty.",
  },
  {
    icon: HeartHandshake,
    title: "Bereavement & hard times",
    body: "There is no timetable for what you are feeling right now.",
  },
  {
    icon: Sprout,
    title: "Burnout & rest",
    body: "Recognising the signs early and giving yourself permission to pause.",
  },
  {
    icon: BookOpen,
    title: "Self-care that fits real life",
    body: "Tiny, doable habits you can keep even on your busiest week.",
  },
];

const testimonials = [
  {
    quote: "I almost never opened the site. Booking took two minutes and I felt held.",
    who: "Year 2 student",
  },
  {
    quote:
      "My peer counsellor didn't judge a single thing. I finally had someone to talk to at night.",
    who: "First-year student",
  },
  {
    quote: "Knowing nothing I shared would be seen by anyone else is what let me start.",
    who: "Graduate student",
  },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-16 size-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-48 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div className="max-w-[42ch] rise-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-medium text-primary-deep">
              <span className="size-1.5 rounded-full bg-primary" />A student wellbeing centre
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              A Safe Space to Talk, Be Heard and Get Support
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
              Willow is for university and college students. Whether you need a licensed counsellor
              or a trained peer who understands campus life, we keep your story private and let you
              decide how much to share.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="pill-lg">
                <Link to="/book">Book a Counselling Session</Link>
              </Button>
              <Button asChild variant="soft" size="pill-lg">
                <Link to="/peer-counselling">Talk to a Peer Counsellor</Link>
              </Button>
            </div>
            <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-full bg-urgent-soft px-4 py-2 text-sm text-urgent-foreground ring-1 ring-urgent/30">
              <LifeBuoy className="size-4" />
              Feeling overwhelmed right now?
              <Link to="/get-help" className="font-semibold underline underline-offset-4">
                Get Help Now
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={calmCorner}
              alt="A quiet, sunlit corner with a warm cup of tea and a soft blanket"
              width={1088}
              height={1280}
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-lift outline-1 -outline-offset-1 outline-border"
            />
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-card/90 p-4 shadow-soft ring-1 ring-border backdrop-blur sm:block">
              <p className="text-xs font-semibold">Confidential by design</p>
              <p className="mt-1 max-w-[24ch] text-xs leading-relaxed text-muted-foreground">
                Your notes stay private to you and your counsellor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-[48ch]">
            <h2 className="text-3xl font-semibold leading-tight text-balance">
              Two ways to start, your way
            </h2>
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              Pick the path that feels right today. You can always move between them as you go.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary-deep">
                  <ShieldCheck className="size-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-deep">
                  Licensed
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-medium">Professional Counselling</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                Work with qualified counsellors and psychologists on therapy, anxiety and everything
                in between. 50-minute sessions, online or in person, with subsidised and
                university-sponsored options.
              </p>
              <Link
                to="/professional-counselling"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-deep"
              >
                See counsellors &amp; fees <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>

            <article className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-primary-deep">
                  <MessageCircleHeart className="size-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-deep">
                  Trained peers
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-medium">Peer Counselling</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                Talk with a trained student peer who has sat in the same lecture halls.
                Low-pressure, free for enrolled students, and often the first step that feels
                doable.
              </p>
              <Link
                to="/peer-counselling"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-deep"
              >
                Meet the peer counsellors <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Confidentiality */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-8 rounded-3xl surface-chrome border border-border p-8 text-primary-foreground shadow-lift sm:p-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                  <Lock className="size-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
                  Privacy &amp; confidentiality
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-medium leading-tight text-balance">
                What you share stays between us
              </h2>
              <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-primary-foreground/85 text-pretty sm:text-base">
                Your details, notes and conversations are encrypted and visible only to you and the
                counsellor you choose. We never display your name, history or appointments publicly.
                We only break confidentiality in rare cases of immediate safety, or where the law
                requires it — and we will talk it through with you wherever possible.
              </p>
              <Link
                to="/privacy"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
              >
                Read the full privacy promise <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-primary-foreground/15 p-4 ring-1 ring-primary-foreground/20">
                <p className="text-sm font-medium">Encrypted end to end</p>
                <p className="mt-1 text-xs text-primary-foreground/80">
                  Notes are protected and never shared.
                </p>
              </div>
              <div className="rounded-2xl bg-primary-foreground/15 p-4 ring-1 ring-primary-foreground/20">
                <p className="text-sm font-medium">You stay in charge</p>
                <p className="mt-1 text-xs text-primary-foreground/80">
                  Use a display name and share only what feels safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[48ch]">
              <h2 className="text-3xl font-semibold leading-tight text-balance">
                Read something first, if you like
              </h2>
              <p className="mt-3 text-base text-muted-foreground text-pretty">
                Short, honest guides. No pressure, no sign-up.
              </p>
            </div>
            <Link to="/resources" className="text-sm font-medium text-primary-deep">
              Browse all resources <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map(({ icon: Icon, title, body }, i) => (
              <Link
                key={title}
                to="/resources"
                className="group rounded-2xl bg-card p-6 ring-1 ring-border transition-transform hover:-translate-y-0.5"
              >
                <span
                  className={`grid size-10 place-items-center rounded-full text-primary-deep ${
                    i % 2 === 0 ? "bg-primary/10" : "bg-accent/15"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-[48ch]">
            <h2 className="text-3xl font-semibold leading-tight text-balance">In their own words</h2>
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              Shared with permission, and always anonymous.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.who} className="rounded-2xl bg-card p-6 ring-1 ring-border">
                <blockquote className="font-display text-lg font-medium leading-snug text-pretty">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-sm font-medium text-muted-foreground">
                  {t.who}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Booking nudge */}
      <section className="border-t border-border bg-sand/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-5 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[46ch]">
            <h2 className="text-2xl font-semibold leading-tight text-balance">
              Taking the first step is the hardest part
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Choose a time that suits you. You can reschedule or cancel free of charge up to 12
              hours before.
            </p>
          </div>
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
