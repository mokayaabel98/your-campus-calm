import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, CreditCard, LifeBuoy, ScrollText, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatKes, formatSlot } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console | Willow Student Wellbeing" },
      {
        name: "description",
        content:
          "Manage counsellors, availability, appointments, payments and assistance requests for the Willow student counselling service.",
      },
      { property: "og:title", content: "Willow admin console" },
      {
        property: "og:description",
        content: "Counsellor approvals, availability, appointments, payments and audit trail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const isAdmin = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) return false;
      return Boolean(data);
    },
  });

  const counsellors = useQuery({
    queryKey: ["admin-counsellors"],
    enabled: isAdmin.data === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counsellors")
        .select(
          "id, display_name, kind, title, focus_areas, session_fee_kes, is_approved, is_active",
        )
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });

  const appointments = useQuery({
    queryKey: ["admin-appointments"],
    enabled: isAdmin.data === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, starts_at, status, format, duration_minutes, counsellors(display_name, kind)")
        .order("starts_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const payments = useQuery({
    queryKey: ["admin-payments"],
    enabled: isAdmin.data === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("id, amount_kes, method, status, reference, receipt_number, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const assistance = useQuery({
    queryKey: ["admin-assistance"],
    enabled: isAdmin.data === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistance_requests")
        .select("id, reason, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const logs = useQuery({
    queryKey: ["admin-logs"],
    enabled: isAdmin.data === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data;
    },
  });

  const toggleCounsellor = useMutation({
    mutationFn: async (input: { id: string; field: "is_approved" | "is_active"; value: boolean }) => {
      const { error } = await supabase
        .from("counsellors")
        .update(
          input.field === "is_approved"
            ? { is_approved: input.value }
            : { is_active: input.value },
        )
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Counsellor updated");
      qc.invalidateQueries({ queryKey: ["admin-counsellors"] });
    },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const markPayment = useMutation({
    mutationFn: async (input: { id: string; status: "paid" | "refunded" | "waived" }) => {
      const { error } = await supabase
        .from("payments")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment updated");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const resolveAssistance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("assistance_requests")
        .update({ status: "resolved" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marked resolved");
      qc.invalidateQueries({ queryKey: ["admin-assistance"] });
    },
    onError: (e: Error) => toast.error("Update failed", { description: e.message }),
  });

  const [slotCounsellor, setSlotCounsellor] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const addSlot = useMutation({
    mutationFn: async () => {
      if (!slotCounsellor || !slotTime) throw new Error("Pick a counsellor and a time");
      const { error } = await supabase.from("availability_slots").insert({
        counsellor_id: slotCounsellor,
        starts_at: new Date(slotTime).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Availability added");
      setSlotTime("");
    },
    onError: (e: Error) => toast.error("Could not add slot", { description: e.message }),
  });

  const [newCounsellor, setNewCounsellor] = useState({
    display_name: "",
    kind: "professional" as "professional" | "peer",
    title: "",
    qualifications: "",
    focus_areas: "",
    languages: "",
    session_fee_kes: "0",
    supports_online: true,
    supports_in_person: true,
    is_approved: true,
  });

  const addCounsellor = useMutation({
    mutationFn: async () => {
      const name = newCounsellor.display_name.trim();
      if (!name) throw new Error("Add a display name");
      const fee = Number(newCounsellor.session_fee_kes);
      if (!Number.isFinite(fee) || fee < 0) throw new Error("Session fee must be zero or more");
      const list = (v: string) =>
        v.split(",").map((s) => s.trim()).filter(Boolean);
      const { error } = await supabase.from("counsellors").insert({
        display_name: name,
        kind: newCounsellor.kind,
        title: newCounsellor.title.trim() || null,
        qualifications: newCounsellor.qualifications.trim() || null,
        focus_areas: list(newCounsellor.focus_areas),
        languages: list(newCounsellor.languages),
        session_fee_kes: Math.round(fee),
        supports_online: newCounsellor.supports_online,
        supports_in_person: newCounsellor.supports_in_person,
        is_approved: newCounsellor.is_approved,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Counsellor added");
      setNewCounsellor((s) => ({
        ...s,
        display_name: "",
        title: "",
        qualifications: "",
        focus_areas: "",
        languages: "",
        session_fee_kes: "0",
      }));
      qc.invalidateQueries({ queryKey: ["admin-counsellors"] });
    },
    onError: (e: Error) => toast.error("Could not add counsellor", { description: e.message }),
  });

  if (loading || isAdmin.isLoading) {
    return <p className="mx-auto max-w-6xl px-5 py-24 text-sm text-muted-foreground">Checking access…</p>;
  }

  if (!isAdmin.data) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center">
        <ShieldCheck className="mx-auto size-8 text-primary" />
        <h1 className="mt-4 text-2xl font-medium">Admin access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This console is limited to service coordinators. Ask an existing administrator to grant
          you the admin role.
        </p>
      </section>
    );
  }

  const paidTotal = (payments.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_kes, 0);

  const stats = [
    { label: "Counsellors", value: String((counsellors.data ?? []).length) },
    { label: "Appointments", value: String((appointments.data ?? []).length) },
    { label: "Collected", value: formatKes(paidTotal) },
    { label: "Assistance requests", value: String((assistance.data ?? []).length) },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Service oversight"
        intro="Approve counsellors, publish availability, follow appointments and payments, and keep an eye on the audit trail. Clinical session notes stay private to their author."
      />

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-medium">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="team" className="mt-10">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="team">
              <UserPlus className="mr-1.5 size-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="counsellors">
              <Users className="mr-1.5 size-4" /> Counsellors
            </TabsTrigger>
            <TabsTrigger value="availability">
              <CalendarPlus className="mr-1.5 size-4" /> Availability
            </TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-1.5 size-4" /> Payments
            </TabsTrigger>
            <TabsTrigger value="assistance">
              <LifeBuoy className="mr-1.5 size-4" /> Assistance
            </TabsTrigger>
            <TabsTrigger value="audit">
              <ScrollText className="mr-1.5 size-4" /> Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {teamCounts.map((t) => (
                <div key={t.label} className="rounded-2xl bg-card p-5 ring-1 ring-border">
                  <p className="text-sm text-muted-foreground">{t.label}</p>
                  <p className="mt-1 text-2xl font-medium">{t.value}</p>
                </div>
              ))}
            </div>

            <div className="grid max-w-3xl gap-5 rounded-3xl bg-card p-7 ring-1 ring-border">
              <h2 className="text-xl font-medium">Add a counsellor</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">Display name</Label>
                  <Input
                    id="c-name"
                    value={newCounsellor.display_name}
                    onChange={(e) =>
                      setNewCounsellor((s) => ({ ...s, display_name: e.target.value }))
                    }
                    placeholder="Dr. Amina K."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={newCounsellor.kind}
                    onValueChange={(v) =>
                      setNewCounsellor((s) => ({ ...s, kind: v as "professional" | "peer" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional counsellor</SelectItem>
                      <SelectItem value="peer">Peer counsellor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-title">Title</Label>
                  <Input
                    id="c-title"
                    value={newCounsellor.title}
                    onChange={(e) => setNewCounsellor((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Clinical psychologist"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-fee">Session fee (KES)</Label>
                  <Input
                    id="c-fee"
                    type="number"
                    min="0"
                    value={newCounsellor.session_fee_kes}
                    onChange={(e) =>
                      setNewCounsellor((s) => ({ ...s, session_fee_kes: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-focus">Focus areas (comma separated)</Label>
                  <Input
                    id="c-focus"
                    value={newCounsellor.focus_areas}
                    onChange={(e) =>
                      setNewCounsellor((s) => ({ ...s, focus_areas: e.target.value }))
                    }
                    placeholder="Anxiety, Exam stress"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-lang">Languages (comma separated)</Label>
                  <Input
                    id="c-lang"
                    value={newCounsellor.languages}
                    onChange={(e) => setNewCounsellor((s) => ({ ...s, languages: e.target.value }))}
                    placeholder="English, Kiswahili"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="c-qual">Qualifications</Label>
                  <Input
                    id="c-qual"
                    value={newCounsellor.qualifications}
                    onChange={(e) =>
                      setNewCounsellor((s) => ({ ...s, qualifications: e.target.value }))
                    }
                    placeholder="MSc Counselling Psychology, licensed"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <label className="flex items-center gap-2">
                  Online sessions
                  <Switch
                    checked={newCounsellor.supports_online}
                    onCheckedChange={(v) =>
                      setNewCounsellor((s) => ({ ...s, supports_online: v }))
                    }
                  />
                </label>
                <label className="flex items-center gap-2">
                  In person
                  <Switch
                    checked={newCounsellor.supports_in_person}
                    onCheckedChange={(v) =>
                      setNewCounsellor((s) => ({ ...s, supports_in_person: v }))
                    }
                  />
                </label>
                <label className="flex items-center gap-2">
                  Approved
                  <Switch
                    checked={newCounsellor.is_approved}
                    onCheckedChange={(v) => setNewCounsellor((s) => ({ ...s, is_approved: v }))}
                  />
                </label>
              </div>

              <Button
                variant="brand"
                size="pill-lg"
                className="justify-self-start"
                onClick={() => addCounsellor.mutate()}
                disabled={addCounsellor.isPending}
              >
                {addCounsellor.isPending ? "Adding…" : "Add counsellor"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="counsellors" className="mt-6 grid gap-3">
            {(counsellors.data ?? []).map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-card p-6 ring-1 ring-border"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    {c.display_name}
                    <Badge variant="secondary">{c.kind}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.title} · {formatKes(c.session_fee_kes)}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <label className="flex items-center gap-2">
                    Approved
                    <Switch
                      checked={c.is_approved}
                      onCheckedChange={(v) =>
                        toggleCounsellor.mutate({ id: c.id, field: "is_approved", value: v })
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    Active
                    <Switch
                      checked={c.is_active}
                      onCheckedChange={(v) =>
                        toggleCounsellor.mutate({ id: c.id, field: "is_active", value: v })
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <div className="grid max-w-xl gap-5 rounded-3xl bg-card p-7 ring-1 ring-border">
              <div className="grid gap-2">
                <Label>Counsellor</Label>
                <Select value={slotCounsellor} onValueChange={setSlotCounsellor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a counsellor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(counsellors.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slot-time">Date and time</Label>
                <Input
                  id="slot-time"
                  type="datetime-local"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                />
              </div>
              <Button
                variant="brand"
                size="pill-lg"
                onClick={() => addSlot.mutate()}
                disabled={addSlot.isPending}
              >
                Publish 50-minute slot
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6 grid gap-3">
            {(appointments.data ?? []).map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-5 py-4 ring-1 ring-border"
              >
                <div className="text-sm">
                  <p className="font-medium">{formatSlot(a.starts_at)}</p>
                  <p className="text-muted-foreground">
                    {a.counsellors?.display_name} · {a.format === "online" ? "Online" : "In person"} ·{" "}
                    {a.duration_minutes} min
                  </p>
                </div>
                <Badge variant="secondary">{a.status}</Badge>
              </div>
            ))}
            {(appointments.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments yet.</p>
            ) : null}
          </TabsContent>

          <TabsContent value="payments" className="mt-6 grid gap-3">
            {(payments.data ?? []).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-5 py-4 ring-1 ring-border"
              >
                <div className="text-sm">
                  <p className="font-medium">{formatKes(p.amount_kes)}</p>
                  <p className="text-muted-foreground">
                    Ref {p.reference} · {p.method}
                    {p.receipt_number ? ` · M-Pesa ${p.receipt_number}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge>
                  <Button
                    variant="soft"
                    size="pill"
                    onClick={() => markPayment.mutate({ id: p.id, status: "waived" })}
                  >
                    Waive
                  </Button>
                  <Button
                    variant="ghost"
                    size="pill"
                    onClick={() => markPayment.mutate({ id: p.id, status: "refunded" })}
                  >
                    Refund
                  </Button>
                </div>
              </div>
            ))}
            {(payments.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded.</p>
            ) : null}
          </TabsContent>

          <TabsContent value="assistance" className="mt-6 grid gap-3">
            {(assistance.data ?? []).map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card px-5 py-4 ring-1 ring-border"
              >
                <p className="max-w-xl text-sm">{a.reason}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{a.status}</Badge>
                  {a.status !== "resolved" ? (
                    <Button variant="soft" size="pill" onClick={() => resolveAssistance.mutate(a.id)}>
                      Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {(assistance.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No assistance requests.</p>
            ) : null}
          </TabsContent>

          <TabsContent value="audit" className="mt-6 grid gap-2">
            {(logs.data ?? []).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 px-4 py-3 text-sm"
              >
                <span>
                  {l.entity} · {l.action}
                </span>
                <span className="text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("en-KE")}
                </span>
              </div>
            ))}
            {(logs.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            ) : null}
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
