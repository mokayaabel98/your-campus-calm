import { createFileRoute } from "@tanstack/react-router";
import { Clock, Lock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Counselling Centre — Willow" },
      {
        name: "description",
        content:
          "Send a secure enquiry, find our opening hours and campus location, or get urgent support contacts.",
      },
      { property: "og:title", content: "Contact the Counselling Centre — Willow" },
      {
        property: "og:description",
        content: "Secure contact form, opening hours, campus location and emergency contacts.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell us what to call you")
    .max(80, "Please keep this under 80 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  subject: z.string().trim().min(1, "Please add a subject").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail")
    .max(1000, "Please keep this under 1000 characters"),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = schema.safeParse(Object.fromEntries(form));
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    e.currentTarget.reset();
    setConsent(false);
    toast.success("Message sent securely", {
      description: "We reply within one working day. Nothing you wrote is visible to other students.",
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Ask us anything, share as little as you like"
        intro="General enquiries only — please do not include clinical details here. If you are in crisis, use the Get Help Now page instead."
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-8">
          <h2 className="text-2xl font-medium">Secure enquiry form</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" /> Encrypted in transit, seen only by the centre team.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">What should we call you?</Label>
              <Input id="name" name="name" placeholder="First name or a display name" />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@university.ac.ke" />
              {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" placeholder="e.g. Booking a first session" />
            {errors.subject ? <p className="text-xs text-destructive">{errors.subject}</p> : null}
          </div>

          <div className="mt-5 grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={6}
              maxLength={1000}
              placeholder="You don't need to explain everything — a sentence is enough."
            />
            {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary/60 p-4">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
              aria-label="Consent to being contacted"
            />
            <span className="text-sm leading-relaxed">
              I consent to Willow storing this message and contacting me by email about my enquiry.
            </span>
          </label>

          <Button type="submit" variant="brand" size="pill-lg" className="mt-6" disabled={!consent}>
            Send securely
          </Button>
        </form>

        <div className="space-y-5">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <h2 className="text-xl font-medium">Counselling centre</h2>
            <ul className="mt-4 space-y-3.5 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="size-4 shrink-0 text-primary-deep" />
                Campus Wellbeing Centre, Gate 4, Main Campus, Nairobi
              </li>
              <li className="flex gap-3">
                <Phone className="size-4 shrink-0 text-primary-deep" />
                +254 20 000 0000
              </li>
              <li className="flex gap-3">
                <Mail className="size-4 shrink-0 text-primary-deep" />
                wellbeing@willow.ac.ke
              </li>
              <li className="flex gap-3">
                <Clock className="size-4 shrink-0 text-primary-deep" />
                Mon–Fri 8am–6pm · Sat 9am–1pm · Closed Sundays
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-3xl ring-1 ring-border">
            <iframe
              title="Campus Wellbeing Centre location"
              src="https://www.google.com/maps?q=Nairobi%20University%20Main%20Campus&output=embed"
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="rounded-3xl bg-urgent-soft p-7 ring-1 ring-urgent/30">
            <h2 className="text-xl font-medium text-urgent-foreground">In an emergency</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80 text-pretty">
              This form is not monitored around the clock. Call 999 or 112, or the free 24-hour
              emotional support line on 1199.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
