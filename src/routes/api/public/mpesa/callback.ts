import { createFileRoute } from "@tanstack/react-router";

type CallbackItem = { Name: string; Value?: string | number };

export const Route = createFileRoute("/api/public/mpesa/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        const cb = body?.Body?.stkCallback;
        const checkoutRequestId = cb?.CheckoutRequestID as string | undefined;
        if (!checkoutRequestId) {
          return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        const resultCode = Number(cb?.ResultCode ?? 1);
        const resultDesc = String(cb?.ResultDesc ?? "");
        const items: CallbackItem[] = cb?.CallbackMetadata?.Item ?? [];
        const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendDonationReceiptEmail, sendPaymentReceiptEmail, sendAppointmentEmail } = await import("@/lib/email.server");

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, student_id, appointment_id, amount_kes, reference")
          .eq("checkout_request_id", checkoutRequestId)
          .maybeSingle();

        if (payment) {
          const paid = resultCode === 0;
          await supabaseAdmin
            .from("payments")
            .update({
              status: paid ? "paid" : "failed",
              receipt_number: receipt ? String(receipt) : null,
              result_desc: resultDesc,
              paid_at: paid ? new Date().toISOString() : null,
            })
            .eq("id", payment.id);

          let apptInfo: any = null;
          if (paid && payment.appointment_id) {
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
            title: paid ? "Payment received" : "Payment not completed",
            body: paid
              ? `M-Pesa receipt ${receipt}. Your session is confirmed.`
              : resultDesc || "The M-Pesa payment was not completed.",
          });

          if (paid) {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("display_name, contact_email, allow_email_notifications")
              .eq("id", payment.student_id)
              .maybeSingle();

            if (profile?.contact_email && (profile.allow_email_notifications ?? true)) {
              await sendPaymentReceiptEmail({
                to: profile.contact_email,
                studentName: profile.display_name,
                amount: payment.amount_kes,
                currency: "KES",
                method: "mpesa",
                reference: payment.reference,
                receiptNumber: receipt ? String(receipt) : null,
              });

              if (apptInfo) {
                const counsellor = apptInfo.counsellors as { display_name?: string; kind?: "professional" | "peer" } | null;
                await sendAppointmentEmail({
                  to: profile.contact_email,
                  studentName: profile.display_name,
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
        } else {
          const paid = resultCode === 0;
          const { data: donation } = await supabaseAdmin
            .from("donations")
            .update({
              status: paid ? "paid" : "failed",
              receipt_number: receipt ? String(receipt) : null,
              result_desc: resultDesc,
              paid_at: paid ? new Date().toISOString() : null,
            })
            .eq("checkout_request_id", checkoutRequestId)
            .select("id, donor_name, donor_email, amount, currency, tier, reference")
            .maybeSingle();

          if (paid && donation?.donor_email) {
            await sendDonationReceiptEmail({
              to: donation.donor_email,
              donorName: donation.donor_name,
              amount: donation.amount,
              currency: donation.currency,
              tier: donation.tier,
              reference: donation.reference,
              receiptNumber: receipt ? String(receipt) : null,
            });
          }
        }

        return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
      },
    },
  },
});
