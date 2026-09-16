import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarDays, CreditCard, LogOut, UserCog } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { MpesaPayButton } from "@/components/site/MpesaPayButton";
import { CardPayButton } from "@/components/site/CardPayButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { formatKes, formatSlot } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard | Willow Student Wellbeing" },
      {
        name: "description",
        content:
          "View upcoming counselling appointments, notifications, payments and privacy preferences in your private Willow dashboard.",
      },
      { property: "og:title", content: "Your Willow dashboard" },
      {
        property: "og:description",
        content: "Manage appointments, notifications and privacy settings privately.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const IDLE_MS = 30 * 60 * 1000;

function useIdleLogout() {
  const navigate = useNavigate();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        toast.info("Signed out", { description: "You were inactive for 30 minutes." });
        navigate({ to: "/auth" });
      }, IDLE_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [navigate]);
}

function Dashboard() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { payment?: "success" | "cancelled"; tab?: string };
  const qc = useQueryClient();
  useIdleLogout();

  const [activeTab, setActiveTab] = useState<string>(
    search.payment ? "payments" : search.tab || "appointments",
  );

  const appointments = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, starts_at, duration_minutes, format, status, student_note, counsellors(display_name, kind)",
        )
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const notifications = useQuery({
    queryKey: ["my-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const payments = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount_kes, method, status, reference, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const profile = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, contact_email, phone, allow_email_notifications, allow_sms_notifications")
        .eq("id", auth.user?.id ?? "")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appointment cancelled");
      qc.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (e: Error) => toast.error("Could not cancel", { description: e.message }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  useEffect(() => {
    if (search.payment === "success") {
      toast.success("Card payment received!", {
        description: "Your session is confirmed. We also sent you a receipt email.",
      });
      appointments.refetch();
      payments.refetch();
    } else if (search.payment === "cancelled") {
      toast.info("Card payment cancelled", {
        description: "You can retry paying whenever you are ready.",
      });
    }
  }, [search.payment]);

  const [saving, setSaving] = useState(false);
  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: String(form.get("display_name") ?? "Student"),
        phone: String(form.get("phone") ?? "") || null,
        allow_email_notifications: form.get("email_notify") === "on",
        allow_sms_notifications: form.get("sms_notify") === "on",
      })
      .eq("id", auth.user?.id ?? "");
    setSaving(false);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return;
    }
    toast.success("Preferences saved");
    qc.invalidateQueries({ queryKey: ["my-profile"] });
  }

  const upcoming = (appointments.data ?? []).filter(
    (a) => a.status !== "cancelled" && new Date(a.starts_at) >= new Date(),
  );
  const past = (appointments.data ?? []).filter(
    (a) => a.status === "cancelled" || new Date(a.starts_at) < new Date(),
  );

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title={`Hello${profile.data?.display_name ? `, ${profile.data.display_name}` : ""}`}
        intro="Everything here is private to you. Only your matched counsellor and the booking coordinators can see your appointment details."
      >
        <Button asChild variant="brand" size="pill">
          <Link to="/book">Book a session</Link>
        </Button>
        <Button
          variant="soft"
          size="pill"
          onClick={async () => {
            await supabase.auth.signOut();
            qc.clear();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 py-14">
        {search.payment === "success" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
            <div className="mt-0.5 rounded-full bg-primary p-1 text-primary-foreground">
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-foreground">Card payment received</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your payment has been confirmed and receipt details have been sent to your email.
              </p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="appointments">
              <CalendarDays className="mr-1.5 size-4" /> Appointments
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-1.5 size-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-1.5 size-4" /> Payments
            </TabsTrigger>
            <TabsTrigger value="profile">
              <UserCog className="mr-1.5 size-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-6 grid gap-4">
            {appointments.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
            {!appointments.isLoading && upcoming.length === 0 ? (
              <div className="rounded-3xl bg-card p-7 text-sm text-muted-foreground ring-1 ring-border">
                You have no upcoming sessions.{" "}
                <Link to="/book" className="text-primary underline">
                  Book one when you are ready.
                </Link>
              </div>
            ) : null}
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-card p-6 ring-1 ring-border"
              >
                <div>
                  <p className="font-medium">{formatSlot(a.starts_at)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.counsellors?.display_name} · {a.counsellors?.kind === "peer" ? "Peer" : "Professional"} ·{" "}
                    {a.format === "online" ? "Online" : "In person"} · {a.duration_minutes} min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{a.status}</Badge>
                  <Button variant="soft" size="pill" onClick={() => cancel.mutate(a.id)}>
                    Cancel
                  </Button>
                  <Button asChild variant="ghost" size="pill">
                    <Link to="/book">Reschedule</Link>
                  </Button>
                </div>
              </div>
            ))}

            {past.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-sm font-medium text-muted-foreground">Past and cancelled</h2>
                <div className="mt-3 grid gap-3">
                  {past.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/50 px-5 py-4 text-sm"
                    >
                      <span>
                        {formatSlot(a.starts_at)} · {a.counsellors?.display_name}
                      </span>
                      <Badge variant="outline">{a.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 grid gap-3">
            {(notifications.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : null}
            {(notifications.data ?? []).map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read_at && markRead.mutate(n.id)}
                className="rounded-2xl bg-card p-5 text-left ring-1 ring-border transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  {!n.read_at ? <span className="size-2 rounded-full bg-primary" /> : null}
                </div>
                {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
              </button>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="mt-6 grid gap-3">
            {(payments.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded.</p>
            ) : null}
            {(payments.data ?? []).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-5 py-4 ring-1 ring-border"
              >
                <div>
                  <p className="font-medium">{formatKes(p.amount_kes)}</p>
                  <p className="text-xs text-muted-foreground">
                    Ref {p.reference} · {p.method}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge>
                  {p.status !== "paid" && p.status !== "waived" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <MpesaPayButton
                        paymentId={p.id}
                        amountKes={p.amount_kes}
                        defaultPhone={profile.data?.phone ?? null}
                        onPaid={() => {
                          payments.refetch();
                          appointments.refetch();
                        }}
                      />
                      <CardPayButton
                        paymentId={p.id}
                        amountKes={p.amount_kes}
                        onInitiated={() => {
                          payments.refetch();
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <form
              onSubmit={saveProfile}
              className="grid max-w-xl gap-5 rounded-3xl bg-card p-7 ring-1 ring-border"
            >
              <div className="grid gap-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile.data?.display_name ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (optional, for M-Pesa and reminders)</Label>
                <Input id="phone" name="phone" defaultValue={profile.data?.phone ?? ""} />
              </div>
              <label className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/60 p-4 text-sm">
                Email notifications
                <Switch name="email_notify" defaultChecked={profile.data?.allow_email_notifications ?? true} />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/60 p-4 text-sm">
                SMS notifications
                <Switch name="sms_notify" defaultChecked={profile.data?.allow_sms_notifications ?? false} />
              </label>
              <Button type="submit" variant="brand" size="pill-lg" disabled={saving}>
                Save preferences
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
