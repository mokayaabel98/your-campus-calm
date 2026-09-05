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
        const paidAt = new Date().toISOString();

        if (kind === "donation") {
          await supabaseAdmin
            .from("donations")
            .update({ status: "paid", paid_at: paidAt, receipt_number: String(session.id) })
            .eq("id", recordId);
          return Response.json({ received: true });
        }

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, student_id, appointment_id")
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

          if (payment.appointment_id) {
            await supabaseAdmin
              .from("appointments")
              .update({ status: "confirmed" })
              .eq("id", payment.appointment_id);
          }

          await supabaseAdmin.from("notifications").insert({
            user_id: payment.student_id,
            title: "Card payment received",
            body: "Your card payment went through and your session is confirmed.",
          });
        }

        return Response.json({ received: true });
      },
    },
  },
});
