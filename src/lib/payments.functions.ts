import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const initiateSchema = z.object({
  paymentId: z.string().uuid(),
  phone: z.string().min(9).max(15),
});

export const initiateMpesaPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => initiateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { normalizeMsisdn, isValidMsisdn, stkPush } = await import("./mpesa.server");

    if (!isValidMsisdn(data.phone)) {
      return { ok: false as const, message: "Enter a valid Safaricom number, e.g. 0712345678" };
    }
    const phone = normalizeMsisdn(data.phone);

    const { data: payment, error } = await context.supabase
      .from("payments")
      .select("id, amount_kes, reference, status, student_id")
      .eq("id", data.paymentId)
      .maybeSingle();

    if (error || !payment) return { ok: false as const, message: "Payment not found" };
    if (payment.student_id !== context.userId) {
      return { ok: false as const, message: "Payment not found" };
    }
    if (payment.status === "paid") {
      return { ok: false as const, message: "This session is already paid for" };
    }

    const origin = process.env["PUBLIC_SITE_URL"] || "https://your-campus-calm.lovable.app";

    try {
      const push = await stkPush({
        phone,
        amount: payment.amount_kes,
        reference: payment.reference,
        description: "Willow counselling session",
        callbackUrl: `${origin}/api/public/mpesa/callback`,
      });

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("payments")
        .update({
          phone,
          status: "pending",
          checkout_request_id: push.checkoutRequestId,
          merchant_request_id: push.merchantRequestId,
          result_desc: push.customerMessage,
        })
        .eq("id", payment.id);

      return { ok: true as const, message: push.customerMessage };
    } catch (e) {
      console.error("[mpesa] stk push failed", e);
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : "Could not start the M-Pesa payment",
      };
    }
  });

export const getPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ paymentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: payment } = await context.supabase
      .from("payments")
      .select("id, status, receipt_number, result_desc, amount_kes, reference")
      .eq("id", data.paymentId)
      .maybeSingle();
    return payment ?? null;
  });
