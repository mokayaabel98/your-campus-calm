import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDonation, type DonationInput } from "@/lib/donations.functions";

export const Route = createFileRoute("/donate")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search["status"] === "string" ? search["status"] : undefined,
    ref: typeof search["ref"] === "string" ? search["ref"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Donate — Support Student Wellbeing | Willow" },
      {
        name: "description",
        content: "Support our mission to provide accessible mental health care for students.",
      },
      { property: "og:title", content: "Donate — Willow Student Wellbeing" },
    ],
  }),
  component: DonatePage,
});

const TIERS = [
  { id: "bronze", label: "Bronze", amount: 500, description: "Subsidises one peer-led group session." },
  { id: "silver", label: "Silver", amount: 1500, description: "Covers one professional counselling session." },
  { id: "gold", label: "Gold", amount: 5000, description: "Funds a month of support for a student in crisis." },
  { id: "custom", label: "Custom", amount: 0, description: "Choose any amount to support our work." },
];

function DonatePage() {
  const search = Route.useSearch();
  const [tier, setTier] = useState<DonationInput["tier"]>("silver");
  const [amount, setAmount] = useState(1500);
  const [method, setMethod] = useState<DonationInput["method"]>("mpesa");
  const [currency, setCurrency] = useState<DonationInput["currency"]>("KES");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: DonationInput = {
      donorName: formData.get("name") as string,
      donorEmail: formData.get("email") as string,
      message: formData.get("message") as string,
      tier,
      amount: tier === "custom" ? Number(formData.get("customAmount")) : amount,
      currency: method === "card" ? currency : "KES",
      method,
      phone: formData.get("phone") as string,
    };

    try {
      const result = await createDonation({ data });
      if (result.ok) {
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          toast.success("Donation initiated", { description: result.message });
        }
      } else {
        toast.error("Donation failed", { description: result.message });
      }
    } catch (error) {
      toast.error("An error occurred", { description: "Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Support Willow"
        title="Help us keep student wellbeing accessible"
        intro="Your donations directly fund subsidised counselling sessions and maintain our peer support network. Every contribution helps a student feel less alone."
      />

      {search.status === "thanks" ? (
        <section className="mx-auto max-w-2xl px-5 py-16 text-center">
          <div className="rounded-3xl bg-card p-10 ring-1 ring-border shadow-soft">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="size-8" />
            </div>
            <h2 className="mt-6 text-2xl font-medium">Thank you for your generous support!</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your donation makes a direct impact on student mental health. A receipt has been sent to your email.
            </p>
            {search.ref ? (
              <div className="mt-6 inline-block rounded-2xl bg-secondary/60 px-5 py-3 text-sm">
                <span className="text-muted-foreground">Donation Reference: </span>
                <span className="font-mono font-semibold text-foreground">{search.ref}</span>
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="brand" size="pill">
                <Link to="/">Back to Home</Link>
              </Button>
              <Button asChild variant="outline" size="pill">
                <Link to="/donate">Donate Again</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-4xl px-5 py-16">
          {search.status === "cancelled" ? (
            <div className="mb-8 rounded-2xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
              Your donation checkout was cancelled. You can try again below whenever you are ready.
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-medium">1. Choose an amount</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {TIERS.map((t) => (
                  <label
                    key={t.id}
                    className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors ${
                      tier === t.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={t.id}
                      checked={tier === t.id}
                      onChange={() => {
                        setTier(t.id as DonationInput["tier"]);
                        if (t.amount > 0) setAmount(t.amount);
                      }}
                      className="sr-only"
                    />

                    <span className="font-medium text-foreground">{t.label}</span>
                    <span className="mt-1 text-2xl font-semibold">
                      {t.amount > 0 ? `KES ${t.amount.toLocaleString()}` : "Custom"}
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
                  </label>
                ))}
              </div>
              {tier === "custom" && (
                <div className="mt-4 grid gap-2">
                  <Label htmlFor="customAmount">Custom amount (KES)</Label>
                  <Input
                    id="customAmount"
                    name="customAmount"
                    type="number"
                    min="100"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-medium">2. Your details (optional)</h2>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Display name or anonymous" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" placeholder="For your receipt" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Why are you supporting Willow?" rows={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
              <h2 className="text-xl font-medium">3. Payment method</h2>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as DonationInput["method"])}
                className="mt-4 grid gap-3"
              >
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                  method === "mpesa" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <Smartphone className="size-5 text-muted-foreground" />
                    <span className="font-medium">M-Pesa</span>
                  </div>
                  <RadioGroupItem value="mpesa" />
                </label>
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                  method === "card" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-5 text-muted-foreground" />
                    <span className="font-medium">Card</span>
                  </div>
                  <RadioGroupItem value="card" />
                </label>
              </RadioGroup>

              {method === "card" && (
                <div className="mt-4 grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(v) => setCurrency(v as DonationInput["currency"])}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                  {currency !== "KES" ? (
                    <p className="text-xs text-muted-foreground">
                      Your card will be charged in {currency}.
                    </p>
                  ) : null}
                </div>
              )}

              {method === "mpesa" && (
                <div className="mt-4 grid gap-2">
                  <Label htmlFor="phone">M-Pesa number</Label>
                  <Input id="phone" name="phone" placeholder="0712345678" required />
                  <p className="text-xs text-muted-foreground">You'll receive a prompt on your phone.</p>
                </div>
              )}

              <Button
                type="submit"
                variant="brand"
                size="pill-lg"
                className="mt-6 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete donation"}
              </Button>
            </div>

            <div className="rounded-3xl bg-secondary/30 p-6 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  Payments are processed securely via M-Pesa or Stripe. Willow does not store your
                  financial details.
                </p>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <Heart className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  As a student-led initiative, we keep overheads low to ensure your support goes
                  where it is needed most.
                </p>
              </div>
            </div>
          </div>
        </form>
      </section>
      )}
    </>
  );
}
