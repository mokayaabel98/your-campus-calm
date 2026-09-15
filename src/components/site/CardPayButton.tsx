import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCardCheckout } from "@/lib/card-payments.functions";
import { formatKes } from "@/lib/booking";

type Props = {
  paymentId: string;
  amountKes: number;
  onInitiated?: () => void;
};

type Currency = "KES" | "USD" | "EUR" | "GBP";

const CURRENCY_CONFIG: Record<Currency, { symbol: string; rate: number; label: string }> = {
  KES: { symbol: "KES", rate: 1, label: "Kenyan Shilling (KES)" },
  USD: { symbol: "$", rate: 1 / 129, label: "US Dollar (USD)" },
  EUR: { symbol: "€", rate: 1 / 140, label: "Euro (EUR)" },
  GBP: { symbol: "£", rate: 1 / 163, label: "British Pound (GBP)" },
};

export function CardPayButton({ paymentId, amountKes, onInitiated }: Props) {
  const checkoutFn = useServerFn(createCardCheckout);

  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("KES");
  const [busy, setBusy] = useState(false);

  const cfg = CURRENCY_CONFIG[currency];
  const convertedAmount =
    currency === "KES"
      ? amountKes
      : Math.max(1, Math.round(amountKes * cfg.rate * 100) / 100);

  const formattedConverted =
    currency === "KES"
      ? formatKes(amountKes)
      : `${cfg.symbol}${convertedAmount.toFixed(2)} ${currency}`;

  async function pay() {
    setBusy(true);
    try {
      const result = await checkoutFn({ data: { paymentId, currency } });
      if (result.ok && result.redirectUrl) {
        toast.info("Redirecting to Stripe", {
          description: "Complete your card payment on the secure checkout page.",
        });
        onInitiated?.();
        window.location.href = result.redirectUrl;
      } else {
        toast.error(result.message || "Could not start card checkout");
      }
    } catch (e) {
      toast.error("Failed to start checkout", {
        description: e instanceof Error ? e.message : "Please try again later or use M-Pesa.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="pill">
          <CreditCard className="size-4" /> Pay with Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Card</DialogTitle>
          <DialogDescription>
            Pay securely with any Visa, Mastercard or international debit/credit card.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor={`currency-${paymentId}`}>Select currency</Label>
            <Select
              value={currency}
              onValueChange={(val) => setCurrency(val as Currency)}
            >
              <SelectTrigger id={`currency-${paymentId}`}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KES">{CURRENCY_CONFIG.KES.label}</SelectItem>
                <SelectItem value="USD">{CURRENCY_CONFIG.USD.label}</SelectItem>
                <SelectItem value="EUR">{CURRENCY_CONFIG.EUR.label}</SelectItem>
                <SelectItem value="GBP">{CURRENCY_CONFIG.GBP.label}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original fee:</span>
              <span className="font-medium">{formatKes(amountKes)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-base font-semibold">
              <span>Amount to charge:</span>
              <span className="text-primary">{formattedConverted}</span>
            </div>
            {currency !== "KES" ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Exchange rate applied for international card processing.
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-background p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Encrypted end-to-end via Stripe. Your card information never touches our servers.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="brand"
            size="pill"
            onClick={pay}
            disabled={busy}
            className="w-full sm:w-auto"
          >
            {busy ? (
              "Preparing checkout…"
            ) : (
              <>
                Continue to Stripe ({formattedConverted}) <ExternalLink className="ml-1 size-3.5" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
