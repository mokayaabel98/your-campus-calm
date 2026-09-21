// Server-only Paystack helpers. Never expose the secret key to the browser.

const API = "https://api.paystack.co";

type PaystackTransaction = { status?: string; reference?: string; receipt_number?: string | null; paid_at?: string | null; customer?: { email?: string | null } };

export function paystackConfigured() { return Boolean(process.env["PAYSTACK_SECRET_KEY"]); }

function secretKey() {
  const key = process.env["PAYSTACK_SECRET_KEY"];
  if (!key) throw new Error("Paystack is not configured");
  return key;
}

function subunitAmount(amount: number) { return Math.max(1, Math.round(amount * 100)); }

export async function initializePaystackTransaction(opts: { amount: number; currency: string; email: string; reference: string; callbackUrl: string; kind: "session" | "donation"; recordId: string; productName: string }) {
  const reference = opts.reference.replace(/[^a-zA-Z0-9\-._=]/g, "-");
  const res = await fetch(API + "/transaction/initialize", {
    method: "POST",
    headers: { Authorization: "Bearer " + secretKey(), "content-type": "application/json" },
    body: JSON.stringify({
      email: opts.email, amount: String(subunitAmount(opts.amount)), currency: opts.currency.toUpperCase(), reference, callback_url: opts.callbackUrl, channels: ["card"],
      metadata: { kind: opts.kind, record_id: opts.recordId, product_name: opts.productName },
    }),
  });
  const json = await res.json() as { status?: boolean; message?: string; data?: { authorization_url?: string; access_code?: string; reference?: string } };
  if (!res.ok || !json.status || !json.data?.authorization_url) throw new Error(json.message || "Paystack could not start checkout");
  return { authorizationUrl: json.data.authorization_url, accessCode: json.data.access_code, reference: json.data.reference || reference };
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(API + "/transaction/verify/" + encodeURIComponent(reference), { headers: { Authorization: "Bearer " + secretKey() } });
  const json = await res.json() as { status?: boolean; message?: string; data?: PaystackTransaction };
  if (!res.ok || !json.status || !json.data) throw new Error(json.message || "Paystack verification failed");
  return json.data;
}

export async function verifyPaystackSignature(payload: string, signature: string | null) {
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret || !signature) return false;
  const { createHmac, timingSafeEqual } = await import("crypto");
  const expected = createHmac("sha512", secret).update(payload).digest("hex");
  // Signature and digest are hex strings; decode as hex so the bytes match.
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export async function settlePaystackTransaction(reference: string) {
  const transaction = await verifyPaystackTransaction(reference);
  if (transaction.status !== "success") return { ok: false as const, kind: "unknown" as const, message: "Paystack payment was not successful" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendDonationReceiptEmail, sendPaymentReceiptEmail, sendAppointmentEmail } = await import("@/lib/email.server");
  const paidAt = transaction.paid_at || new Date().toISOString();
  const receipt = transaction.receipt_number || transaction.reference || reference;
  const { data: payment } = await supabaseAdmin.from("payments").select("id, student_id, appointment_id, amount_kes, reference, status").eq("checkout_request_id", reference).maybeSingle();
  if (payment) {
    if (payment.status === "paid") return { ok: true as const, kind: "payment" as const, alreadySettled: true };
    await supabaseAdmin.from("payments").update({ status: "paid", paid_at: paidAt, receipt_number: String(receipt), result_desc: "Paystack payment completed" }).eq("id", payment.id);
    let apptInfo: any = null;
    if (payment.appointment_id) {
      const { data: appt } = await supabaseAdmin.from("appointments").update({ status: "confirmed" }).eq("id", payment.appointment_id).select("id, starts_at, duration_minutes, format, counsellors(display_name, kind)").maybeSingle();
      apptInfo = appt;
    }
    await supabaseAdmin.from("notifications").insert({ user_id: payment.student_id, title: "Card payment received", body: "Your Paystack payment went through and your session is confirmed." });
    const { data: profile } = await supabaseAdmin.from("profiles").select("display_name, contact_email, allow_email_notifications").eq("id", payment.student_id).maybeSingle();
    const studentEmail = profile?.contact_email || transaction.customer?.email || undefined;
    if (studentEmail && (profile?.allow_email_notifications ?? true)) {
      await sendPaymentReceiptEmail({ to: studentEmail, studentName: profile?.display_name || null, amount: payment.amount_kes, currency: "KES", method: "card", reference: payment.reference, receiptNumber: String(receipt) });
      if (apptInfo) {
        const counsellor = apptInfo.counsellors as { display_name?: string; kind?: "professional" | "peer" } | null;
        await sendAppointmentEmail({ to: studentEmail, studentName: profile?.display_name || null, counsellorName: counsellor?.display_name || "Your Counsellor", counsellorKind: counsellor?.kind || "professional", startsAt: apptInfo.starts_at, format: apptInfo.format, durationMinutes: apptInfo.duration_minutes, status: "confirmed" });
      }
    }
    return { ok: true as const, kind: "payment" as const, alreadySettled: false };
  }
  const { data: donation } = await supabaseAdmin.from("donations").select("id, donor_name, donor_email, amount, currency, tier, reference, status").eq("checkout_request_id", reference).maybeSingle();
  if (!donation) return { ok: false as const, kind: "unknown" as const, message: "Payment record not found" };
  if (donation.status === "paid") return { ok: true as const, kind: "donation" as const, alreadySettled: true };
  const { data: settledDonation } = await supabaseAdmin.from("donations").update({ status: "paid", paid_at: paidAt, receipt_number: String(receipt), result_desc: "Paystack payment completed" }).eq("id", donation.id).select("id, donor_name, donor_email, amount, currency, tier, reference").maybeSingle();
  const donorEmail = settledDonation?.donor_email || transaction.customer?.email || undefined;
  if (donorEmail && settledDonation) await sendDonationReceiptEmail({ to: donorEmail, donorName: settledDonation.donor_name, amount: settledDonation.amount, currency: settledDonation.currency, tier: settledDonation.tier, reference: settledDonation.reference, receiptNumber: String(receipt) });
  return { ok: true as const, kind: "donation" as const, alreadySettled: false };
}
