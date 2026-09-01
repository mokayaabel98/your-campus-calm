import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Database,
  Eye,
  FileLock2,
  Lock,
  ScrollText,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Confidentiality — Willow Student Counselling" },
      {
        name: "description",
        content:
          "Our full privacy promise: what we collect, why, who can see it, your rights, and the HIPAA-aligned safeguards protecting your counselling records.",
      },
      { property: "og:title", content: "Privacy & Confidentiality — Willow" },
      {
        property: "og:description",
        content:
          "A HIPAA-aligned notice of privacy practices written in plain student language, with your rights and our safeguards spelled out.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const blocks = [
  {
    icon: Database,
    title: "What we collect",
    body: "A contact email, your institution, a display name, your notification preferences, and the details you choose to give when booking — preferred format, preferred time and an optional note. For paid sessions we store an amount, a method and a transaction reference, never a card number or M-Pesa PIN. Clinical content lives only in session notes written by your counsellor. We do not ask for your national ID number, home address, next of kin, religion or sexual orientation unless you volunteer it, and nothing on this platform requires it.",
  },
  {
    icon: Eye,
    title: "Why we collect it",
    body: "Four purposes only, matching the HIPAA notion of treatment, payment and operations: to confirm you are a student entitled to the service, to arrange and remind you about appointments, to keep clinical care safe and continuous between sessions, and to process payment where a fee applies. We do not sell data, we do not run advertising or third-party trackers, and we never use your identifiable information for research or marketing without separate written authorisation that you can refuse or withdraw.",
  },
  {
    icon: UserCheck,
    title: "Who can see it — minimum necessary",
    body: "Access follows the HIPAA minimum-necessary principle: each role sees the least it needs. You see everything of your own. Your counsellor sees your appointment and the notes they authored. A clinical supervisor may review notes for practitioners they supervise. Peer counsellors see a display name, requested support areas and a time — never clinical notes or payments. Administrators manage bookings, refunds and accounts but are blocked at the database level from opening counselling notes or messages. Nobody in your department, faculty or family is given access.",
  },
  {
    icon: Lock,
    title: "How it is protected",
    body: "Technical safeguards mirror the HIPAA Security Rule: TLS 1.2+ for everything in transit, AES-256 encryption at rest, unique per-user accounts with strong-password enforcement, optional two-factor authentication, automatic sign-out after 30 minutes of inactivity, and row-level authorisation so a request for someone else's record is refused by the database itself rather than by the interface. Backups are encrypted and access-controlled. Administrative safeguards include role-based provisioning, confidentiality agreements for every counsellor and peer counsellor, annual privacy training, and vetted processors bound by written data-protection terms.",
  },
  {
    icon: ScrollText,
    title: "Audit logging",
    body: "Every creation, change and access to a sensitive record writes an immutable audit entry recording who acted, what they did, which record was touched and when. Audit logs are readable only by authorised administrators, cannot be edited or deleted through the application, and are reviewed for unusual access patterns. If you ever want to know who has looked at your record, you can ask for an accounting of disclosures.",
  },
  {
    icon: Trash2,
    title: "Keeping and deleting data",
    body: "Clinical records are retained for the period professional and legal standards require — commonly six years from the last session, or until the age of majority plus six years where the client was a minor — then securely destroyed. Appointment and payment records follow financial-record requirements. Everything else, including account and preference data, is deleted when it is no longer needed or on your request. Deletion is cryptographic and irreversible, and applies to backups on their next rotation cycle.",
  },
];

const rights = [
  {
    title: "Right to access and get a copy",
    body: "You can request a copy of the information we hold about you, including your appointment history and payment records, and we respond within 30 days. Access to raw clinical notes may be provided through a supervised review where releasing them unmediated could reasonably cause harm — in that case you are told why, and you can ask for the decision to be reviewed.",
  },
  {
    title: "Right to correction",
    body: "If something we hold is factually wrong or incomplete, you can ask us to amend it. Where a clinical judgement cannot simply be overwritten, your written statement of disagreement is attached to the record permanently and travels with it.",
  },
  {
    title: "Right to restrict and to confidential communication",
    body: "You can ask us to limit how your information is used or disclosed, and to contact you only in a specific way — for example email only, no SMS, or a particular address. Requests for confidential communication are honoured without you having to explain why.",
  },
  {
    title: "Right to an accounting of disclosures",
    body: "You can ask for a list of the disclosures we have made outside treatment, payment and operations, covering the previous six years, drawn from the audit log.",
  },
  {
    title: "Right to withdraw consent",
    body: "Consent given here can be withdrawn at any time from your account privacy preferences. Withdrawal is not retroactive to disclosures already lawfully made, and it never affects your right to book support.",
  },
  {
    title: "Right to be told about a breach",
    body: "If your information is ever involved in a breach of unsecured records, we will notify you without unreasonable delay and within 60 days, describing what happened, what was affected, what we are doing and what you can do.",
  },
  {
    title: "Right to complain",
    body: "You can complain to the Willow Data Protection Officer at privacy@willowwellbeing.co.ke and, separately, to the Office of the Data Protection Commissioner in Kenya. You will never be penalised, deprioritised or refused support for making a complaint.",
  },
];

function PrivacyPage() {
  const [consent, setConsent] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Privacy & confidentiality"
        title="What you tell us stays between us"
        intro="This page is deliberately easy to find. It is our full notice of privacy practices, written to HIPAA-aligned standards and Kenya's Data Protection Act, in plain language and with no small print."
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
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "There is a serious and imminent risk to your life or safety.",
              "There is a risk of serious harm to another identifiable person.",
              "There is reasonable suspicion of abuse or neglect of a child or vulnerable adult.",
              "We are required to disclose by law, subpoena or a court order.",
            ].map((t) => (
              <li key={t} className="rounded-2xl bg-card p-5 text-sm leading-relaxed ring-1 ring-border">
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[68ch] text-sm leading-relaxed text-foreground/80 text-pretty">
            Even then, we disclose the minimum necessary, to the specific people who can keep
            someone safe, and we log the disclosure so you can be told about it afterwards. Never
            to your family, lecturers or classmates by default.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary-deep">
          <FileLock2 className="size-5" />
        </span>
        <h2 className="mt-4 text-3xl font-semibold leading-tight text-balance">Your rights</h2>
        <p className="mt-3 max-w-[68ch] text-base text-muted-foreground text-pretty">
          These are rights, not favours. Exercising any of them takes one email and costs nothing.
        </p>
        <Accordion type="single" collapsible className="mt-6">
          {rights.map((r) => (
            <AccordionItem key={r.title} value={r.title} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {r.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {r.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
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
              including my rights and the limited situations where confidentiality may be broken.
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
          <p className="mt-5 text-xs text-muted-foreground">
            Notice last updated 1 September 2026. Data Protection Officer:
            privacy@willowwellbeing.co.ke · +254 20 764 0000.
          </p>
        </div>
      </section>
    </>
  );
}
