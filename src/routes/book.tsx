import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Counselling Session | Willow Student Wellbeing" },
      {
        name: "description",
        content:
          "Request a confidential professional or peer counselling session. Choose online or in-person, pick a time that works, and share only what you want to.",
      },
      { property: "og:title", content: "Book a Counselling Session — Willow" },
      {
        property: "og:description",
        content: "Private, respectful booking for professional and peer counselling sessions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

const schema = z.object({
  displayName: z.string().trim().min(2, "Tell us what to call you").max(60),
  email: z.string().trim().email("Enter a valid email"),
  serviceType: z.string().min(1, "Choose a service"),
  format: z.string().min(1, "Choose a format"),
  preferredDay: z.string().min(1, "Choose a preferred day"),
  preferredTime: z.string().min(1, "Choose a preferred time"),
  notes: z.string().max(500).optional(),
});

const slots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

function BookPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceType, setServiceType] = useState("");
  const [format, setFormat] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [consent, setConsent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = schema.safeParse({
      ...Object.fromEntries(form),
      serviceType,
      format,
      preferredTime,
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    e.currentTarget.reset();
    setServiceType("");
    setFormat("");
    setPreferredTime("");
    setConsent(false);
    toast.success("Request received", {
      description:
        "We will confirm your session by email within one working day. Your request is private.",
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="Book a session at your own pace"
        intro="Send a request and the coordination team will confirm a time with you. Sessions last 50 minutes. Peer support is always free; professional sessions can be free, subsidised or paid."
      >
        <Button asChild variant="soft" size="pill">
          <Link to="/get-help">Need urgent support?</Link>
        </Button>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-8">
          <h2 className="text-2xl font-medium">Session request</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" /> Encrypted in transit and never shown to other students.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="displayName">What should we call you?</Label>
              <Input id="displayName" name="displayName" placeholder="First name or display name" />
              {errors['displayName'] ? (
                <p className="text-xs text-destructive">{errors['displayName']}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email for confirmation</Label>
              <Input id="email" name="email" type="email" placeholder="you@university.ac.ke" />
              {errors['email'] ? <p className="text-xs text-destructive">{errors['email']}</p> : null}
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type of support</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional counselling</SelectItem>
                  <SelectItem value="peer">Peer counselling (free)</SelectItem>
                  <SelectItem value="unsure">I am not sure yet</SelectItem>
                </SelectContent>
              </Select>
              {errors['serviceType'] ? (
                <p className="text-xs text-destructive">{errors['serviceType']}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Online or in person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online (video or voice)</SelectItem>
                  <SelectItem value="in-person">In person on campus</SelectItem>
                </SelectContent>
              </Select>
              {errors['format'] ? (
                <p className="text-xs text-destructive">{errors['format']}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="preferredDay">Preferred day</Label>
              <Input id="preferredDay" name="preferredDay" type="date" />
              {errors['preferredDay'] ? (
                <p className="text-xs text-destructive">{errors['preferredDay']}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Preferred time</Label>
              <Select value={preferredTime} onValueChange={setPreferredTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a slot" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['preferredTime'] ? (
                <p className="text-xs text-destructive">{errors['preferredTime']}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <Label htmlFor="notes">Anything you would like us to know? (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={5}
              maxLength={500}
              placeholder="A sentence is enough. You never have to explain everything up front."
            />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary/60 p-4">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
              aria-label="Consent to booking contact"
            />
            <span className="text-sm leading-relaxed">
              I consent to Willow storing this request and contacting me to confirm a session.
            </span>
          </label>

          <Button type="submit" variant="brand" size="pill-lg" className="mt-6" disabled={!consent}>
            Request session
          </Button>
        </form>

        <aside className="grid content-start gap-5">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="mt-3 text-lg font-medium">Who sees this</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Only the booking coordinators and the counsellor you are matched with. Peer
              counsellors never see payment details or clinical notes.
            </p>
          </div>
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <Clock className="size-5 text-primary" />
            <h2 className="mt-3 text-lg font-medium">What happens next</h2>
            <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-muted-foreground">
              <li>We reply within one working day with a confirmed time.</li>
              <li>Sessions run for 50 minutes.</li>
              <li>You can reschedule or cancel free of charge up to 12 hours before.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-sand p-7">
            <CalendarCheck className="size-5 text-primary-deep" />
            <h2 className="mt-3 text-lg font-medium">Cost and support</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Peer counselling is free. Professional sessions may be university-sponsored,
              subsidised or paid — and you can request financial assistance at any point.
            </p>
            <Button asChild variant="soft" size="pill" className="mt-4">
              <Link to="/professional-counselling">See fees</Link>
            </Button>
          </div>
        </aside>
      </section>
    </>
  );
}
