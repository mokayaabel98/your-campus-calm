import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text();
        const { settlePaystackTransaction, verifyPaystackSignature } = await import("@/lib/paystack.server");
        if (!await verifyPaystackSignature(payload, request.headers.get("x-paystack-signature"))) {
          return new Response("Invalid signature", { status: 401 });
        }
        let event: any;
        try {
          event = JSON.parse(payload);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }
        if (event?.event === "charge.success" && event?.data?.reference) {
          await settlePaystackTransaction(String(event.data.reference));
        }
        return Response.json({ received: true });
      },
    },
  },
});
