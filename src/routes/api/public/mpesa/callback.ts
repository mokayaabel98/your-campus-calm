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

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, student_id, appointment_id")
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

          if (paid && payment.appointment_id) {
            await supabaseAdmin
              .from("appointments")
              .update({ status: "confirmed" })
              .eq("id", payment.appointment_id);
          }

          await supabaseAdmin.from("notifications").insert({
            user_id: payment.student_id,
            title: paid ? "Payment received" : "Payment not completed",
            body: paid
              ? `M-Pesa receipt ${receipt}. Your session is confirmed.`
              : resultDesc || "The M-Pesa payment was not completed.",
          });
        }

        return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
      },
    },
  },
});
