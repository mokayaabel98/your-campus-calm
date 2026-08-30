import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MessageSquare, Phone, ShieldAlert, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/get-help")({
  head: () => ({
    meta: [
      { title: "Get Help Now — Urgent Support Contacts | Willow" },
      {
        name: "description",
        content:
          "Immediate contacts for crisis lines, campus services and trusted support channels. Willow is not an emergency service.",
      },
      { property: "og:title", content: "Get Help Now — Urgent Support Contacts" },
      {
        property: "og:description",
        content: "Crisis lines, campus services and trusted support channels, available right now.",
      },
    ],
  }),
  component: GetHelpPage,
});

const lines = [
  {
    icon: Phone,
    label: "Emergency services",
    value: "999 or 112",
    body: "If you or someone else is in immediate physical danger, call now.",
  },
  {
    icon: MessageSquare,
    label: "Kenya Red Cross emotional support",
    value: "1199",
    body: "Free, confidential, 24 hours a day, from any network.",
  },
  {
    icon: Users,
    label: "Befrienders Kenya",
    value: "+254 722 178 177",
    body: "Trained volunteers for anyone in emotional distress or feeling suicidal.",
  },
  {
    icon: Building2,
    label: "Campus Wellbeing Centre",
    value: "Gate 4 · Mon–Fri, 8am–6pm",
    body: "Walk in without an appointment. Ask at the desk for the duty counsellor.",
  },
];

function GetHelpPage() {
  return (
    <>
      <section className="border-b border-border bg-urgent-soft">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-medium text-urgent-foreground ring-1 ring-urgent/30">
            <ShieldAlert className="size-3.5" /> Urgent support
          </span>
          <h1 className="mt-5 max-w-[20ch] text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            You do not have to get through this alone
          </h1>
          <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-foreground/80 text-pretty sm:text-lg">
            Willow is not an emergency service and cannot respond in real time. What we can do is
            point you straight to people who can, right now.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {lines.map(({ icon: Icon, label, value, body }) => (
            <article key={label} className="rounded-3xl bg-card p-7 ring-1 ring-border">
              <span className="grid size-11 place-items-center rounded-full bg-urgent-soft text-urgent-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-lg font-medium">{label}</h2>
              <p className="mt-1 font-display text-2xl font-semibold text-primary-deep">{value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-sand/70 p-7 ring-1 ring-border">
          <h2 className="text-2xl font-medium">If it is not an emergency, but it is heavy</h2>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground text-pretty">
            You can still ask for support today. Book the next available counselling slot, or send a
            message to a peer counsellor and say only as much as you want to.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="brand" size="pill-lg">
              <Link to="/book">Book a Session</Link>
            </Button>
            <Button asChild variant="soft" size="pill-lg">
              <Link to="/peer-counselling">Talk to a Peer</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
