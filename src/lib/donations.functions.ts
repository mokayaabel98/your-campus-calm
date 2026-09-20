import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || undefined);

const donationSchema = z.object({
  donorName: optionalText(80),
  donorEmail: optionalText(255).refine(
    (v) => !v || z.string().email().safeParse(v).success,
    { message: "Invalid email address" },
  ),
  message: optionalText(500),
  tier: z.enum(["bronze", "silver", "gold", "custom"]),
  amount: z.number().positive().max(10_000_000),
  currency: z.enum(["KES", "USD", "EUR", "GBP"]),
  method: z.enum(["mpesa", "card"]),
  phone: optionalText(20),
});

export type DonationInput = z.infer<typeof donationSchema>;

function siteOrigin() {
  return process.env["PUBLIC_SITE_URL"] || "https://your-campus-calm.vercel.app";
}

export const createDonation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => donationSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.method === "mpesa" && data.currency !== "KES") {
      return { ok: false as const, message: "M-Pesa can only accept Kenyan shillings. Choose card for other currencies." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .insert({
        donor_name: data.donorName || null,
        donor_email: data.donorEmail || null,
        message: data.message || null,
        tier: data.tier,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        phone: data.phone || null,
      })
      .select("id, reference, amount, currency")
      .single();

    if (error || !donation) {
      return { ok: false as const, message: "Could not start the donation. Please try again." };
    }

    if (data.method === "card") {
      if (!data.donorEmail) return { ok: false as const, message: "Enter an email address for your Paystack receipt." };
      const { initializePaystackTransaction, paystackConfigured } = await import("./paystack.server");
      if (!paystackConfigured()) {
        return {
          ok: false as const,
          message:
            "Paystack card donations are not switched on yet. Please use M-Pesa, or contact us at support.campuswell@gmail.com.",
        };
      }
      try {
        const origin = siteOrigin();
        const session = await initializePaystackTransaction({
          amount: data.amount,
          currency: data.currency,
          productName: "Donation to Willow Student Wellbeing",
          description: `${data.tier} supporter`,
          callbackUrl: `${origin}/api/public/paystack/callback`,
          email: data.donorEmail,
          reference: donation.reference,
          kind: "donation",
          recordId: donation.id,
          productName: "Donation to Willow Student Wellbeing",
        });
        await supabaseAdmin
          .from("donations")
          .update({ checkout_request_id: session.reference, result_desc: "Paystack checkout initialized" })
          .eq("id", donation.id);
        return { ok: true as const, redirectUrl: session.authorizationUrl, message: "Redirecting to secure card checkout" };
      } catch (e) {
        return {
          ok: false as const,
          message: e instanceof Error ? e.message : "Card payment could not be started",
        };
      }
    }

    const { normalizeMsisdn, isValidMsisdn, stkPush } = await import("./mpesa.server");
    if (!data.phone || !isValidMsisdn(data.phone)) {
      return { ok: false as const, message: "Enter a valid Safaricom number, for example 0712345678" };
    }

    try {
      const push = await stkPush({
        phone: normalizeMsisdn(data.phone),
        amount: data.amount,
        reference: donation.reference,
        description: "Willow donation",
        callbackUrl: `${siteOrigin()}/api/public/mpesa/callback`,
      });
      await supabaseAdmin
        .from("donations")
        .update({
          phone: normalizeMsisdn(data.phone),
          checkout_request_id: push.checkoutRequestId,
          result_desc: push.customerMessage,
        })
        .eq("id", donation.id);
      return { ok: true as const, redirectUrl: null, message: push.customerMessage };
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : "Could not start the M-Pesa donation",
      };
    }
  });
