import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPaymentStatus, initiateMpesaPayment } from "@/lib/payments.functions";
import { formatKes } from "@/lib/booking";

type Props = {
  paymentId: string;
  amountKes: number;
  defaultPhone?: string | null;
  onPaid?: () => void;
};

export function MpesaPayButton({ paymentId, amountKes, defaultPhone, onPaid }: Props) {
  const initiate = useServerFn(initiateMpesaPayment);
  const checkStatus = useServerFn(getPaymentStatus);

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (poll.current) clearInterval(poll.current); }, []);

  function startPolling() {
    setWaiting(true);
    let ticks = 0;
    poll.current = setInterval(async () => {
      ticks += 1;
      const payment = await checkStatus({ data: { paymentId } });
      if (payment?.status === "paid") {
        clearInterval(poll.current!);
        setWaiting(false);
        setOpen(false);
        toast.success("Payment received", {
          description: `M-Pesa receipt ${payment.receipt_number ?? ""}`.trim(),
        });
        onPaid?.();
      } else if (payment?.status === "failed") {
        clearInterval(poll.current!);
        setWaiting(false);
        toast.error("Payment not completed", { description: payment.result_desc ?? undefined });
      } else if (ticks > 40) {
        clearInterval(poll.current!);
        setWaiting(false);
        toast.info("Still waiting for M-Pesa", {
          description: "We will update your payment history as soon as Safaricom confirms.",
        });
      }
    }, 3000);
  }

  async function pay() {
    setBusy(true);
    const result = await initiate({ data: { paymentId, phone } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Check your phone", { description: result.message });
    startPolling();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand" size="pill">
          <Smartphone className="size-4" /> Pay {formatKes(amountKes)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay with M-Pesa</DialogTitle>
          <DialogDescription>
            We will send an STK prompt to your phone. Enter your M-Pesa PIN to complete the
            {` ${formatKes(amountKes)} `}payment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor={`phone-${paymentId}`}>Safaricom number</Label>
          <Input
            id={`phone-${paymentId}`}
            inputMode="tel"
            placeholder="07XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="brand" size="pill" onClick={pay} disabled={busy || waiting || !phone}>
            {waiting ? "Waiting for confirmation…" : busy ? "Sending prompt…" : "Send M-Pesa prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
