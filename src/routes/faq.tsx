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
    a: "Yes. Everything you say to a counsellor is treated as a protected health record. It is not shared with your lecturers, your department, your parents, your sponsor or your employer, and it never appears on your academic transcript. Access is role-based and every view of a clinical record is written to an audit log. The only exceptions are the narrow, legally recognised ones: a serious and imminent risk to your life or someone else's, suspected abuse of a child or vulnerable adult, or a court order. Even then only the minimum necessary information goes to the specific people who can keep someone safe, and your counsellor will tell you first wherever it is safe to do so.",
  },
  {
    q: "Can I talk to a peer counsellor anonymously?",
    a: "Effectively, yes. You can register a display name or initials and that is all your peer counsellor sees — no legal name, no course, no student number. We still hold a contact email so appointment details can reach you securely, but it is not shown to peer counsellors. Peer counsellors also work under a written confidentiality agreement with the same safety exceptions, and they have no access to clinical notes or payment records at any time.",
  },
  {
    q: "Who can access my information?",
    a: "Access is granted by role and by relationship, not by seniority. You can see all of your own data. The counsellor you are booked with can see the appointment and the notes they authored. A clinical supervisor may review notes for the practitioners they supervise, which is a professional-standards requirement that keeps your care safe. Peer counsellors see only a display name, the areas you asked for support with, and the appointment time. Administrators can manage bookings, refunds and accounts but cannot open counselling notes or messages — the database enforces this, so it is not a matter of policy alone. Every access to a sensitive record generates an audit entry with actor, action, record and timestamp.",
  },
  {
    q: "What happens during my first counselling session?",
    a: "It is mostly listening, and it is called an assessment or intake session. In roughly 50 minutes your counsellor will explain confidentiality and its limits, ask what brought you here now, and gather background at whatever pace you set — mood, sleep, studies, relationships, safety. You may be offered brief standardised questionnaires such as the PHQ-9 for mood or GAD-7 for anxiety; you see your own scores and they inform the plan rather than label you. You will finish by agreeing goals and a rough number of sessions — commonly six to eight for short-term work. There is no test, nothing to perform, and no obligation to talk about anything before you are ready. Saying 'I don't know where to start' is a normal beginning.",
  },
  {
    q: "Can I choose my counsellor?",
    a: "Yes, and it matters. Decades of psychotherapy research find the quality of the therapeutic alliance is one of the most consistent predictors of outcome — often more than the specific method used. You can browse profiles by qualification, modality (CBT, person-centred, trauma-informed), language, area of focus, gender and availability, and choose accordingly. If it does not feel right after a session or two, you can switch to another counsellor without explaining yourself and without losing your place.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Any time up to 12 hours before your session, free of charge, from your dashboard — the slot returns to the calendar automatically and another student can use it. Inside 12 hours, paid sessions may be charged in part because the time is held for you; peer sessions are never charged. If something serious happened — illness, bereavement, a crisis — tell us and we waive it, without requiring documentation. Repeated non-attendance without contact triggers a supportive conversation, not a penalty, because it is usually a sign that something is wrong.",
  },
  {
    q: "How much does counselling cost?",
    a: "Peer counselling is always free. Professional sessions are free where your university sponsors them, KSh 500 subsidised, or KSh 1,500 standard for a 50-minute session; blocks of six sessions are discounted. You always see the exact price before you confirm, and you never pay to book — payment is linked to a confirmed appointment and generates a reference number and receipt in your dashboard. If cost is the reason you are hesitating, use the financial-assistance request: it asks for no documentation, is reviewed by administrators only, and is never seen by your counsellor.",
  },
  {
    q: "What happens if I need more specialised support?",
    a: "Counselling is one tier in a stepped-care system. If your needs sit outside what campus counselling can safely offer — for example a suspected bipolar or psychotic illness, a serious eating disorder, complex trauma, or symptoms needing medication — your counsellor will discuss a referral with you and help arrange it, usually to a psychiatrist, a specialist service or a longer-term programme. With your written consent a summary is shared with the receiving clinician so you do not have to tell the whole story again. You keep your existing sessions while the referral is set up; we do not hand you a phone number and close the file.",
  },
  {
    q: "Can I access support remotely?",
    a: "Yes. Most counsellors offer encrypted video or voice sessions, and peer support can happen entirely through private messages. Trials comparing remote and in-person therapy find broadly equivalent outcomes for common problems such as depression and anxiety. Camera off is completely fine. Practical advice: use headphones, find a room where you will not be overheard — a booked study pod works when your hostel does not — and tell your counsellor where you physically are at the start, which is a safety requirement for remote work. If your connection is poor, sessions can switch to voice or phone.",
  },
  {
    q: "What happens in an emergency?",
    a: "Willow is not an emergency service and is not monitored 24 hours a day. If you or someone else is in immediate danger, contact emergency services on 999 or 112, go to the nearest emergency department, or call the Kenya Red Cross free 24-hour line on 1199 or Befrienders Kenya on +254 722 178 177. The Get Help Now page lists these plus nearby services and works without an account or login. If you are having thoughts of suicide but are not in immediate danger, you can still book urgently — say so when booking and we prioritise you rather than putting you in the ordinary queue.",
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
