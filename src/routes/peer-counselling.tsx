import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Info, MessageCircleHeart } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/peer-counselling")({
  head: () => ({
    meta: [
      { title: "Peer Counselling — Talk to a Trained Student Supporter | Willow" },
      {
        name: "description",
        content:
          "Free, low-pressure support from trained student peer counsellors. Choose someone by availability and area of interest, and message privately.",
      },
      { property: "og:title", content: "Peer Counselling — Talk to a Trained Student Supporter" },
      {
        property: "og:description",
        content:
          "Free peer support from trained students who understand campus life. Private and low-pressure.",
      },
    ],
  }),
  component: PeerPage,
});

const peers = [
  {
    name: "Amara K.",
    year: "4th year, Psychology",
    interests: ["First-year settling in", "Homesickness", "Exam nerves"],
    availability: "Evenings, Mon–Thu",
  },
  {
    name: "Brian O.",
    year: "3rd year, Engineering",
    interests: ["Academic pressure", "Burnout", "Money worries"],
    availability: "Weekends",
  },
  {
    name: "Nia",
    year: "Postgraduate, Public Health",
    interests: ["Anxiety", "Friendships", "Sleep"],
    availability: "Weekday mornings",
  },
  {
    name: "T. Mwangi",
    year: "4th year, Law",
    interests: ["Family expectations", "Identity", "Motivation"],
    availability: "Tue & Fri afternoons",
  },
];

function PeerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free for enrolled students"
        title="Talk to someone who has been where you are"
        intro="Peer counsellors are students trained to listen well, without judgement. It is not therapy — it is a conversation with someone who understands campus life and knows where to point you next."
      >
        <Button asChild variant="brand" size="pill-lg">
          <Link to="/book">Request a peer chat</Link>
        </Button>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <h2 className="text-2xl font-medium">What peer counselling is</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              <li className="ms-5 list-disc">A confidential, friendly conversation, in person or by message.</li>
              <li className="ms-5 list-disc">Trained listening, practical campus knowledge and gentle encouragement.</li>
              <li className="ms-5 list-disc">Free, with no limit on how many times you reach out.</li>
              <li className="ms-5 list-disc">A good first step if booking a counsellor feels like too much right now.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-urgent-soft p-7 ring-1 ring-urgent/30">
            <div className="flex items-center gap-2 text-urgent-foreground">
              <Info className="size-5" />
              <h2 className="text-2xl font-medium">What it is not</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-urgent-foreground/90 text-pretty">
              Peer counsellors are trained supporters, not licensed mental-health professionals.
              They do not diagnose, provide therapy or prescribe anything. If what you are carrying
              needs clinical support, your peer counsellor will help you take the next step towards{" "}
              <Link to="/professional-counselling" className="font-semibold underline underline-offset-4">
                professional counselling
              </Link>
              , and in an emergency they will point you to{" "}
              <Link to="/get-help" className="font-semibold underline underline-offset-4">
                urgent support
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-[52ch]">
            <h2 className="text-3xl font-semibold leading-tight text-balance">
              Choose a peer counsellor
            </h2>
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              Peer counsellors use a first name, initials or a chosen display name. Pick someone by
              availability or the things they know something about.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {peers.map((p) => (
              <article key={p.name} className="rounded-3xl bg-card p-6 ring-1 ring-border">
                <span className="grid size-11 place-items-center rounded-full bg-accent/15 text-primary-deep">
                  <MessageCircleHeart className="size-5" />
                </span>
                <h3 className="mt-4 text-xl font-medium">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.year}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.interests.map((i) => (
                    <li
                      key={i}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4 shrink-0" />
                  {p.availability}
                </p>
                <Button asChild variant="soft" size="pill" className="mt-6 w-full">
                  <Link to="/book">Message privately</Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-3xl surface-chrome border border-border p-8 text-primary-foreground shadow-lift sm:p-10">
          <h2 className="text-3xl font-medium leading-tight text-balance">
            Trained, supported and supervised
          </h2>
          <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-primary-foreground/85 text-pretty sm:text-base">
            Every peer counsellor completes accredited listening-skills training, safeguarding and
            confidentiality training, and meets a professional supervisor regularly. Your
            conversations are private — supervision discusses practice, never your identity.
          </p>
        </div>
      </section>
    </>
  );
}
