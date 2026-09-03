import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In to Your Willow Student Account" },
      {
        name: "description",
        content:
          "Create a secure Willow account to book counselling sessions, view appointments and manage your privacy preferences.",
      },
      { property: "og:title", content: "Sign in — Willow Student Wellbeing" },
      {
        property: "og:description",
        content: "Secure, private access to your counselling appointments and notifications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number");

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);
    if (error) {
      toast.error("Could not sign in", { description: error.message });
      return;
    }
    toast.success("Welcome back");
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      return toast.error("Choose a stronger password", {
        description: parsed.error.issues[0]?.message,
      });
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email") ?? ""),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: String(form.get("displayName") ?? "") },
      },
    });
    setBusy(false);
    if (error) return toast.error("Could not create account", { description: error.message });
    toast.success("Account created", {
      description: "If email confirmation is required, check your inbox to finish signing in.",
    });
  }

  async function google() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (error) {
      toast.error("Google sign-in failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Student account"
        title="Your private space at Willow"
        intro="Create an account to book sessions, see upcoming appointments and manage your privacy preferences. We only ask for what we need."
      />

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-card p-7 ring-1 ring-border sm:p-8">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="si-password">Password</Label>
                  <Input
                    id="si-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" variant="brand" size="pill-lg" disabled={busy}>
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="su-name">What should we call you?</Label>
                  <Input id="su-name" name="displayName" placeholder="First name or nickname" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="su-password">Password</Label>
                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 10 characters with upper and lower case letters and a number.
                  </p>
                </div>
                <Button type="submit" variant="brand" size="pill-lg" disabled={busy}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="soft" size="pill-lg" className="w-full" onClick={google}>
            Continue with Google
          </Button>
        </div>

        <aside className="grid content-start gap-5">
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="mt-3 text-lg font-medium">Private by design</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your appointments, notes and payments are never visible to other students. Peer
              counsellors never see clinical notes or payment details.
            </p>
          </div>
          <div className="rounded-3xl bg-sand p-7">
            <Lock className="size-5 text-primary-deep" />
            <h2 className="mt-3 text-lg font-medium">Session safety</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You are signed out automatically after 30 minutes of inactivity on a shared device.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
