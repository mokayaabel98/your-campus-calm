import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/paystack/callback")({
  server: { handlers: { GET: async ({ request }) => {
    const requestUrl = new URL(request.url);
    const reference = requestUrl.searchParams.get("reference");
    if (!reference) return new Response("Missing Paystack reference", { status: 400 });
    const { settlePaystackTransaction } = await import("@/lib/paystack.server");
    const result = await settlePaystackTransaction(reference);
    const origin = process.env["PUBLIC_SITE_URL"] || requestUrl.origin;
    const destination = result.kind === "donation" ? "/donate?status=" + (result.ok ? "thanks" : "cancelled") + "&ref=" + encodeURIComponent(reference) : "/dashboard?payment=" + (result.ok ? "success" : "cancelled");
    return Response.redirect(new URL(destination, origin), 303);
  } }
});
