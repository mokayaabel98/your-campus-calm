import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text();
        const { verifyStripeSignature } = await import("@/lib/stripe.server");

        const valid = await verifyStripeSignature(payload, request.headers.get("stripe-signature"));
        if (!valid) return new Response("Invalid signature", { status: 401 });

        let event: any;
        try {
          event = JSON.parse(payload);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        if (event?.type !== "checkout.session.completed") {
          return Response.json({ received: true });
        }

        const session = event.data?.object ?? {};
        const kind = session?.metadata?.kind as string | undefined;
        const recordId = session?.metadata?.record_id as string | undefined;
        if (!recordId) return Response.json({ received: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendDonationReceiptEmail, sendPaymentReceiptEmail, sendAppointmentEmail } = await import("@/lib/email.server");
        const paidAt = new Date().toISOString();

        if (kind === "donation") {
          const { data: donation } = await supabaseAdmin
            .from("donations")
            .update({ status: "paid", paid_at: paidAt, receipt_number: String(session.id) })
            .eq("id", recordId)
            .select("id, donor_name, donor_email, amount, currency, tier, reference")
            .maybeSingle();

          const donorEmail = donation?.donor_email || (session?.customer_details?.email as string | undefined);
          if (donorEmail && donation) {
            await sendDonationReceiptEmail({
              to: donorEmail,
              donorName: donation.donor_name,
              amount: donation.amount,
              currency: donation.currency,
              tier: donation.tier,
              reference: donation.reference,
              receiptNumber: String(session.id),
            });
          }
          return Response.json({ received: true });
        }

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, student_id, appointment_id, amount_kes, currency, reference")
          .eq("id", recordId)
          .maybeSingle();

        if (payment) {
          await supabaseAdmin
            .from("payments")
            .update({
              status: "paid",
              paid_at: paidAt,
              receipt_number: String(session.id),
              result_desc: "Card payment completed",
            })
            .eq("id", payment.id);

          let apptInfo: any = null;
          if (payment.appointment_id) {
            const { data: appt } = await supabaseAdmin
              .from("appointments")
              .update({ status: "confirmed" })
              .eq("id", payment.appointment_id)
              .select("id, starts_at, duration_minutes, format, counsellors(display_name, kind)")
              .maybeSingle();
            apptInfo = appt;
          }

          await supabaseAdmin.from("notifications").insert({
            user_id: payment.student_id,
            title: "Card payment received",
            body: "Your card payment went through and your session is confirmed.",
          });

          // Fetch student profile for transactional email
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("display_name, contact_email, allow_email_notifications")
            .eq("id", payment.student_id)
            .maybeSingle();

          const studentEmail = profile?.contact_email || (session?.customer_details?.email as string | undefined);
          if (studentEmail && (profile?.allow_email_notifications ?? true)) {
            await sendPaymentReceiptEmail({
              to: studentEmail,
              studentName: profile?.display_name || null,
              amount: payment.amount_kes,
              currency: "KES",
              method: "card",
              reference: payment.reference,
              receiptNumber: String(session.id),
            });

            if (apptInfo) {
              const counsellor = apptInfo.counsellors as { display_name?: string; kind?: "professional" | "peer" } | null;
              await sendAppointmentEmail({
                to: studentEmail,
                studentName: profile?.display_name || null,
                counsellorName: counsellor?.display_name || "Your Counsellor",
                counsellorKind: counsellor?.kind || "professional",
                startsAt: apptInfo.starts_at,
                format: apptInfo.format,
                durationMinutes: apptInfo.duration_minutes,
                status: "confirmed",
              });
            }
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
