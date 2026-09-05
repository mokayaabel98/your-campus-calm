// Server-only Stripe helpers (card and international payments).
// Uses the Stripe REST API directly so it runs in the edge runtime.

const API = "https://api.stripe.com/v1";

export function stripeConfigured() {
  return Boolean(process.env["STRIPE_SECRET_KEY"]);
}

function form(params: Record<string, string | number | undefined>) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") body.set(k, String(v));
  }
  return body;
}

// Stripe expects the smallest currency unit, except for zero-decimal currencies.
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "XAF", "XOF", "UGX"]);

export function toMinorUnits(amount: number, currency: string) {
  const code = currency.toUpperCase();
  return ZERO_DECIMAL.has(code) ? Math.round(amount) : Math.round(amount * 100);
}

export async function createCheckoutSession(opts: {
  amount: number;
  currency: string;
  productName: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  email?: string | undefined;
  reference: string;
  kind: "session" | "donation";
  recordId: string;
}) {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Card payments are not connected yet");

  const params: Record<string, string | number | undefined> = {
    mode: "payment",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    client_reference_id: opts.reference,
    "line_items[0][quantity]": 1,
    "line_items[0][price_data][currency]": opts.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": toMinorUnits(opts.amount, opts.currency),
    "line_items[0][price_data][product_data][name]": opts.productName,
    "metadata[kind]": opts.kind,
    "metadata[record_id]": opts.recordId,
    "metadata[reference]": opts.reference,
  };
  if (opts.description) {
    params["line_items[0][price_data][product_data][description]"] = opts.description;
  }
  if (opts.email) params["customer_email"] = opts.email;

  const res = await fetch(`${API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form(params),
  });

  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = json["error"] as { message?: string } | undefined;
    throw new Error(err?.message ?? "Stripe declined the request");
  }
  return { id: String(json["id"]), url: String(json["url"]) };
}

export async function verifyStripeSignature(payload: string, header: string | null) {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret || !header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k?.trim() ?? "", rest.join("=")];
    }),
  ) as Record<string, string>;

  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const { createHmac, timingSafeEqual } = await import("crypto");
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
