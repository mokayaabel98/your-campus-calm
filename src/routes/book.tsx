import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKes, formatSlot } from "@/lib/booking";
import { notifyAppointmentBooked } from "@/lib/booking.functions";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Counselling Session | Willow Student Wellbeing" },
      {
        name: "description",
        content:
          "Choose a professional or peer counsellor, pick a real available time and confirm a private 50-minute session online or on campus.",
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

function BookPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const notifyBooked = useServerFn(notifyAppointmentBooked);

  const [kind, setKind] = useState<"professional" | "peer">("professional");
  const [counsellorId, setCounsellorId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [format, setFormat] = useState("online");
  const [method, setMethod] = useState("mpesa");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const counsellors = useQuery({
    queryKey: ["counsellors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counsellors")
        .select(
          "id, display_name, kind, title, focus_areas, session_fee_kes, supports_online, supports_in_person",
        )
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });

  const slots = useQuery({
    queryKey: ["slots", counsellorId],
    enabled: Boolean(counsellorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("id, starts_at, duration_minutes")
        .eq("counsellor_id", counsellorId)
        .eq("is_booked", false)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(40);
      if (error) throw error;
      return data;
    },
  });

  const list = useMemo(
    () => (counsellors.data ?? []).filter((c) => c.kind === kind),
    [counsellors.data, kind],
  );
  const selected = list.find((c) => c.id === counsellorId);
  const fee = selected?.session_fee_kes ?? 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth" });
    if (!counsellorId || !slotId) {
      return toast.error("Pick a counsellor and an available time");
    }
    const slot = (slots.data ?? []).find((s) => s.id === slotId);
    if (!slot) return toast.error("That time is no longer available");

    setBusy(true);
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        student_id: user.id,
        counsellor_id: counsellorId,
        slot_id: slotId,
        starts_at: slot.starts_at,
        duration_minutes: slot.duration_minutes,
        format: format as "online" | "in_person",
        student_note: note || null,
      })
      .select("id")
      .single();

    if (error || !appointment) {
      setBusy(false);
      return toast.error("Could not book that session", { description: error?.message });
    }

    if (fee > 0) {
      await supabase.from("payments").insert({
        student_id: user.id,
        appointment_id: appointment.id,
        amount_kes: fee,
        method: method as "mpesa" | "card" | "mobile_money" | "bank",
      });
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Session request received",
      body: `We will confirm your ${formatSlot(slot.starts_at)} session shortly.`,
    });

    // Trigger transactional confirmation email (with fallback when unconfigured)
    await notifyBooked({ data: { appointmentId: appointment.id } }).catch(() => {});

    setBusy(false);
    setSlotId("");
    setNote("");
    setConsent(false);
    slots.refetch();
    toast.success("Session requested", {
      description:
        fee > 0
          ? `Complete payment via M-Pesa or Card from the Payments tab in your dashboard.`
          : "You can see it in your dashboard. We confirm within one working day.",
    });
    navigate({ to: "/dashboard" });
  }

  async function requestAssistance() {
    if (!user) return navigate({ to: "/auth" });
    const { error } = await supabase
      .from("assistance_requests")
      .insert({ student_id: user.id, reason: "Requested financial assistance from booking page" });
    if (error) return toast.error("Could not send request", { description: error.message });
    toast.success("Request sent", { description: "A coordinator will get back to you privately." });
  }

  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="Book a session at your own pace"
        intro="Pick a counsellor, choose from real available times and confirm. Sessions last 50 minutes. Peer support is always free; professional sessions can be free, subsidised or paid."
      >
        <Button asChild variant="soft" size="pill">
          <Link to="/get-help">Need urgent support?</Link>
        </Button>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-8">
          <h2 className="text-2xl font-medium">Session request</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" /> Encrypted in transit and never shown to other students.
          </p>

          {!loading && !user ? (
            <div className="mt-5 rounded-2xl bg-secondary/60 p-4 text-sm">
              <p>Sign in to keep your booking private and see it in your dashboard.</p>
              <Button asChild variant="brand" size="pill" className="mt-3">
                <Link to="/auth">Sign in or create an account</Link>
              </Button>
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Type of support</Label>
              <Select
                value={kind}
                onValueChange={(v) => {
                  setKind(v as "professional" | "peer");
                  setCounsellorId("");
                  setSlotId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional counselling</SelectItem>
                  <SelectItem value="peer">Peer counselling (free)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Online or in person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online (video or voice)</SelectItem>
                  <SelectItem value="in_person">In person on campus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <Label>Counsellor</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setCounsellorId(c.id);
                    setSlotId("");
                  }}
                  className={`rounded-2xl p-4 text-left ring-1 transition-colors ${
                    counsellorId === c.id
                      ? "bg-secondary ring-primary"
                      : "bg-background ring-border hover:bg-secondary/50"
                  }`}
                >
                  <p className="font-medium">{c.display_name}</p>
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.focus_areas.slice(0, 3).map((f) => (
                      <Badge key={f} variant="secondary" className="text-[11px]">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-medium">{formatKes(c.session_fee_kes)}</p>
                </button>
              ))}
              {counsellors.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading counsellors…</p>
              ) : null}
            </div>
          </div>

          {counsellorId ? (
            <div className="mt-5 grid gap-2">
              <Label>Available times</Label>
              {slots.isLoading ? (
                <p className="text-sm text-muted-foreground">Checking availability…</p>
              ) : (slots.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open times right now — try another counsellor.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(slots.data ?? []).map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSlotId(s.id)}
                      className={`rounded-full px-4 py-2 text-sm ring-1 transition-colors ${
                        slotId === s.id
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-background ring-border hover:bg-secondary"
                      }`}
                    >
                      {formatSlot(s.starts_at)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {fee > 0 ? (
            <div className="mt-5 grid gap-2">
              <Label>Payment method ({formatKes(fee)} due after confirmation)</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile_money">Other mobile money</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={requestAssistance}
                className="justify-self-start text-xs text-primary underline"
              >
                I need financial assistance
              </button>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            <Label htmlFor="notes">Anything you would like us to know? (optional)</Label>
            <Textarea
              id="notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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

          <Button
            type="submit"
            variant="brand"
            size="pill-lg"
            className="mt-6"
            disabled={!consent || busy || !user}
          >
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
