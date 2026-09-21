import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  paymentId: z.string().uuid(),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]).default("KES"),
});

// Rough indicative conversion so international students can pay in their own currency.
const RATE_FROM_KES: Record<string, number> = {
  KES: 1,
  USD: 1 / 129,
  EUR: 1 / 140,
  GBP: 1 / 163,
};

export const createCardCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: payment, error } = await context.supabase
      .from("payments")
      .select("id, amount_kes, reference, status, student_id")
      .eq("id", data.paymentId)
      .maybeSingle();

    if (error || !payment || payment.student_id !== context.userId) {
      return { ok: false as const, message: "Payment not found" };
    }
    if (payment.status === "paid") {
      return { ok: false as const, message: "This session is already paid for" };
    }

    const { initializePaystackTransaction, paystackConfigured } = await import("./paystack.server");
    if (!paystackConfigured()) {
      return {
        ok: false as const,
        message:
          "Paystack card payments are not switched on yet. Please use M-Pesa for now, or email support.campuswell@gmail.com.",
      };
    }

    const email = context.claims?.email as string | undefined;
    if (!email) return { ok: false as const, message: "Add an email address to your account before paying by card." };

    const rate = RATE_FROM_KES[data.currency] ?? 1;
    const amount = data.currency === "KES"
      ? payment.amount_kes
      : Math.max(1, Math.round(payment.amount_kes * rate * 100) / 100);

    const origin = process.env["PUBLIC_SITE_URL"] || "https://your-campus-calm.vercel.app";

    try {
      const session = await initializePaystackTransaction({
        amount,
        currency: data.currency,
        productName: "Willow counselling session",
        callbackUrl: `${origin}/api/public/paystack/callback`,
        email,
        reference: payment.reference,
        kind: "session",
        recordId: payment.id,
      });

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("payments")
        .update({ method: "card", status: "pending", checkout_request_id: session.reference, result_desc: "Paystack checkout initialized" })
        .eq("id", payment.id);

      return { ok: true as const, redirectUrl: session.authorizationUrl, message: "Opening secure card checkout" };
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : "Card payment could not be started",
      };
    }
  });
