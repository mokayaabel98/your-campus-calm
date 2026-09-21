// Server-only Safaricom Daraja (M-Pesa) helpers.

function base() {
  return process.env["DARAJA_ENV"] === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export function normalizeMsisdn(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

export function isValidMsisdn(input: string) {
  return /^254[17]\d{8}$/.test(normalizeMsisdn(input));
}

async function getAccessToken() {
  const key = process.env["DARAJA_CONSUMER_KEY"];
  const secret = process.env["DARAJA_CONSUMER_SECRET"];
  if (!key || !secret) throw new Error("M-Pesa is not configured");

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${base()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error("Could not reach M-Pesa right now");
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Could not authenticate with M-Pesa");
  return json.access_token;
}

function timestamp() {
  // Daraja expects the timestamp in East Africa Time (UTC+3), not the server's
  // own timezone. Servers run in UTC, which makes Safaricom reject the password.
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

export async function stkPush(opts: {
  phone: string;
  amount: number;
  reference: string;
  description: string;
  callbackUrl: string;
}) {
  const shortcode = process.env["DARAJA_SHORTCODE"];
  const passkey = process.env["DARAJA_PASSKEY"];
  if (!shortcode || !passkey) throw new Error("M-Pesa is not configured");
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
  const token = await getAccessToken();

  const res = await fetch(`${base()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(opts.amount)),
      PartyA: opts.phone,
      PartyB: shortcode,
      PhoneNumber: opts.phone,
      CallBackURL: opts.callbackUrl,
      AccountReference: opts.reference.slice(0, 12),
      TransactionDesc: opts.description.slice(0, 40),
    }),
  });

  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || String(json["ResponseCode"] ?? "") !== "0") {
    const message =
      (json["errorMessage"] as string) ||
      (json["ResponseDescription"] as string) ||
      "M-Pesa declined the request";
    throw new Error(message);
  }
  return {
    checkoutRequestId: String(json["CheckoutRequestID"]),
    merchantRequestId: String(json["MerchantRequestID"]),
    customerMessage: String(json["CustomerMessage"] ?? "Check your phone for the M-Pesa prompt"),
  };
}
