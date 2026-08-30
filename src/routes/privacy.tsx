import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Database, Eye, Lock, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Confidentiality — Willow Student Counselling" },
      {
        name: "description",
        content:
          "What we collect, why, who can see it, and the limited situations where confidentiality may need to be broken. Explained in plain student-friendly language.",
      },
      { property: "og:title", content: "Privacy & Confidentiality — Willow" },
      {
        property: "og:description",
        content:
          "Plain-language answers on what we collect, who can see it, and how your counselling stays private.",
      },
    ],
  }),
  component: PrivacyPage,
});

const blocks = [
  {
    icon: Database,
    title: "What we collect",
    body: "A contact email, your institution, a display name and the details you choose to give when booking. For paid sessions we store a payment reference — never your card number. That is it. We do not ask for your ID number, address or next of kin unless you volunteer it.",
  },
  {
    icon: Eye,
    title: "Why we collect it",
    body: "To confirm you are a student, to arrange and remind you about appointments, to keep clinical care safe and continuous, and to process payments where a fee applies.",
  },
  {
    icon: UserCheck,
    title: "Who can see it",
    body: "You, and the counsellor you are booked with. Session notes are clinical records visible only to your counsellor and their supervisor. Peer counsellors never see clinical notes or payment details. Administrators can manage bookings and payments but cannot open counselling notes or conversations. Every access to a sensitive record is logged.",
  },
  {
    icon: Lock,
    title: "How it is protected",
    body: "Everything travels over HTTPS and is encrypted at rest. Accounts require a strong password, offer two-factor authentication, and log you out automatically after a period of inactivity. Access is role-based, so nobody sees more than their role requires.",
  },
  {
    icon: Trash2,
    title: "Keeping and deleting data",
    body: "Clinical records are retained for the period professional standards require, then securely destroyed. Everything else is deleted when it is no longer needed. You can ask for your account and non-clinical data to be deleted at any time.",
  },
];

function PrivacyPage() {
  const [consent, setConsent] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Privacy & confidentiality"
        title="What you tell us stays between us"
        intro="This page is deliberately easy to find. Before you share anything, you deserve to know exactly what happens to it — in plain language, with no small print."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {blocks.map(({ icon: Icon, title, body }) => (
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

      <section className="border-y border-border bg-urgent-soft/60">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex items-center gap-2.5 text-urgent-foreground">
            <AlertTriangle className="size-5" />
            <h2 className="text-2xl font-medium">
              When confidentiality may need to be broken
            </h2>
          </div>
          <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-foreground/80 text-pretty">
            This is rare, and we will talk it through with you first wherever it is safe to do so.
            Your counsellor may need to share limited information when:
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              "There is a serious and immediate risk to your life or safety.",
              "There is a risk of serious harm to another person, especially a child or vulnerable adult.",
              "We are required to disclose information by law or a court order.",
            ].map((t) => (
              <li key={t} className="rounded-2xl bg-card p-5 text-sm leading-relaxed ring-1 ring-border">
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[68ch] text-sm leading-relaxed text-foreground/80 text-pretty">
            Even then, we share the minimum necessary, with the people who need it to keep someone
            safe — never with your family, lecturers or classmates by default.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-9">
          <h2 className="text-2xl font-medium">Your consent</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            We ask for your consent before you submit anything sensitive, and you can withdraw it at
            any time from your account privacy preferences. Withdrawing consent does not affect your
            right to book support.
          </p>
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary/60 p-4">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
              aria-label="I have read and understood the privacy and confidentiality notice"
            />
            <span className="text-sm leading-relaxed">
              I have read and understood how my information is collected, used and protected,
              including the limited situations where confidentiality may be broken.
            </span>
          </label>
          <Button
            variant="brand"
            size="pill"
            className="mt-6"
            disabled={!consent}
            onClick={() => toast.success("Consent recorded", {
              description: "You can change this any time in your privacy preferences.",
            })}
          >
            Record my consent
          </Button>
        </div>
      </section>
    </>
  );
}
