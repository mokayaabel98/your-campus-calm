import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Student Counselling Questions Answered | Willow" },
      {
        name: "description",
        content:
          "Is counselling confidential? Can I be anonymous with a peer counsellor? What does it cost? Honest answers to the questions students ask most.",
      },
      { property: "og:title", content: "FAQ — Student Counselling Questions Answered" },
      {
        property: "og:description",
        content:
          "Confidentiality, anonymity, cost, cancellations and emergencies — answered in plain language.",
      },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "Is counselling confidential?",
    a: "Yes. What you say stays between you and your counsellor. The only exceptions are a serious and immediate risk to your safety or someone else's, or where the law requires disclosure — and we explain that fully on the Privacy page.",
  },
  {
    q: "Can I talk to a peer counsellor anonymously?",
    a: "Yes. You can use a display name instead of your real name for peer support. We still need a contact email so we can send you appointment details securely, but your peer counsellor does not see it.",
  },
  {
    q: "Who can access my information?",
    a: "You, and the counsellor you are booked with. Session notes are visible only to your counsellor and their clinical supervisor. Peer counsellors never see clinical notes. Administrators can manage bookings and payments but cannot read counselling notes or conversations, and every access to sensitive records is logged.",
  },
  {
    q: "What happens during my first counselling session?",
    a: "Mostly listening. Your counsellor will explain confidentiality, ask what brought you here, and agree with you what you would like to work on. There is no test, no form to perform, and no obligation to talk about anything before you are ready.",
  },
  {
    q: "Can I choose my counsellor?",
    a: "Yes. Browse profiles by qualification, area of support and availability, and pick whoever feels like a fit. If it is not right after a session or two, you can switch without explaining yourself.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Any time up to 12 hours before your session, free of charge, from your account. Later cancellations may be charged for paid sessions, and we waive that if something serious happened.",
  },
  {
    q: "How much does counselling cost?",
    a: "Peer counselling is free. Professional sessions are free where your university sponsors them, KSh 500 subsidised, or KSh 1,500 standard for 50 minutes, with packages available. You always see the price before you confirm, and you can request financial assistance.",
  },
  {
    q: "What happens if I need more specialised support?",
    a: "Your counsellor will discuss a referral with you — to a psychiatrist, a specialist service or a longer-term programme — and help arrange it. We will not simply hand you a phone number and close your file.",
  },
  {
    q: "Can I access support remotely?",
    a: "Yes. Most counsellors offer encrypted video or voice sessions, and peer support can happen entirely by private message. Camera off is completely fine.",
  },
  {
    q: "What happens in an emergency?",
    a: "Willow is not an emergency service. If you or someone else is in immediate danger, use the Get Help Now page for crisis lines and nearby services, or contact local emergency services straight away.",
  },
];

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Questions students ask"
        title="Honest answers, before you commit to anything"
        intro="If your question is not here, contact us — no detail about your situation is needed to ask."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-10 text-sm text-muted-foreground">
          Still unsure?{" "}
          <Link to="/contact" className="font-medium text-primary-deep underline underline-offset-4">
            Send us a question
          </Link>{" "}
          — we answer within one working day.
        </p>
      </section>
    </>
  );
}
