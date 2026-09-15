import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  appointmentId: z.string().uuid(),
});

export const notifyAppointmentBooked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: appt, error } = await context.supabase
      .from("appointments")
      .select(
        "id, starts_at, duration_minutes, format, status, student_id, counsellors(display_name, kind)",
      )
      .eq("id", data.appointmentId)
      .maybeSingle();

    if (error || !appt || appt.student_id !== context.userId) {
      return { ok: false as const };
    }

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name, contact_email, allow_email_notifications")
      .eq("id", context.userId)
      .maybeSingle();

    const email = profile?.contact_email || (context.claims?.email as string | undefined);
    const allowNotify = profile?.allow_email_notifications ?? true;

    if (email && allowNotify) {
      const { sendAppointmentEmail } = await import("./email.server");
      const counsellor = appt.counsellors as { display_name?: string; kind?: "professional" | "peer" } | null;
      await sendAppointmentEmail({
        to: email,
        studentName: profile?.display_name || null,
        counsellorName: counsellor?.display_name || "Your Counsellor",
        counsellorKind: counsellor?.kind || "professional",
        startsAt: appt.starts_at,
        format: appt.format,
        durationMinutes: appt.duration_minutes,
        status: appt.status === "confirmed" ? "confirmed" : "requested",
      });
    }

    return { ok: true as const };
  });
