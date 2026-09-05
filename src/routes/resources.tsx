import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  HeartHandshake,
  LifeBuoy,
  Moon,
  Sparkles,
  Sprout,
  Stethoscope,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import stressImg from "@/assets/resource-stress.jpg";
import anxietyImg from "@/assets/resource-anxiety.jpg";
import relationshipsImg from "@/assets/resource-relationships.jpg";
import griefImg from "@/assets/resource-grief.jpg";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Mental Health Resources for Students — Willow" },
      {
        name: "description",
        content:
          "Evidence-based guides on academic stress, anxiety, relationships, bereavement, burnout and self-care for university students, plus when to seek professional help.",
      },
      { property: "og:title", content: "Mental Health Resources for Student Life" },
      {
        property: "og:description",
        content:
          "Evidence-based, student-tested guides on stress, anxiety, relationships, grief, burnout and coping — free, no sign-up.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

type Guide = {
  icon: typeof Sparkles;
  title: string;
  image?: string;
  alt?: string;
  summary: string;
  science: string;
  signs: string[];
  practice: { label: string; detail: string }[];
};

const guides: Guide[] = [
  {
    icon: Sparkles,
    title: "Stress & academic pressure",
    image: stressImg,
    alt: "University students studying together on a sunny campus lawn",
    summary:
      "Stress is your body preparing for a demand. In short bursts it sharpens attention and memory; sustained for weeks it does the opposite.",
    science:
      "1. The Biological Trade-off: Acute stress releases cortisol to fuel immediate focus. Chronic stress keeps cortisol elevated, which actively shrinks dendrites in the hippocampus—the brain's primary hub for forming new memories.\n\n2. The Sleep-Performance Trap: Elevated stress disrupts deep sleep cycles. Without adequate slow-wave sleep, the brain cannot clear metabolic waste or consolidate information learned during the day, making study sessions significantly less effective.\n\n3. The \"Inverted-U\" Peak: Performance improves with arousal up to an optimal point (the Yerkes-Dodson Law). Beyond that inflection point, anxiety overwhelms executive functioning and working memory capacity drops.",
    signs: [
      "Cognitive: Brain fog, re-reading the same page three times without absorbing it, and sudden memory blanks during exams.",
      "Physical: Constant jaw clenching, tension headaches, shallow breathing, and persistent digestive issues.",
      "Behavioral: Procrastinating by hyper-focusing on low-priority tasks, isolation, or feeling irritable over minor academic setbacks.",
      "Irritability with friends, flatmates or family over small things",
    ],
    practice: [
      {
        label: "Strategic Micro-Breaks:",
        detail:
          "Switch tasks every 45–50 minutes. Moving around or stepping away resets cognitive fatigue faster than passive scrolling.",
      },
      {
        label: "Physiological Sighs:",
        detail:
          "Two quick inhales through the nose followed by a long exhale through the mouth rapidly lowers heart rate and offloads carbon dioxide during acute panic.",
      },
      {
        label: "Brain Dumps:",
        detail:
          "Writing down specific worries on paper before studying empties working memory space, freeing up mental bandwidth for complex problem-solving.",
      },
      {
        label: "Targeted Support:",
        detail:
          "",
      },
    ],
  },
  {
    icon: Moon,
    title: "Anxiety & emotional wellbeing",
    image: anxietyImg,
    alt: "A student sitting calmly by a window with a warm drink",
    summary:
      "Anxiety is a future-focused alarm. It is not dangerous in itself — the problem is avoidance, which teaches the alarm that it was right.",
    science:
      "The amygdala flags a possible threat and initiates a response before conscious appraisal finishes. Each time you avoid the feared situation, relief negatively reinforces the avoidance, so the fear strengthens. Cognitive behavioural therapy works by reversing this: graded exposure gives the brain repeated evidence that the predicted catastrophe does not arrive, a process called inhibitory learning. CBT has among the strongest evidence bases in mental health for generalised anxiety, social anxiety and panic.",
    signs: [
      "Racing heart, tight chest or shallow breathing with no physical cause",
      "Dropping tutorials, presentations or social plans to avoid the feeling",
      "Constant 'what if' scanning, checking and reassurance-seeking",
      "Feeling detached, or that the room is somehow unreal",
    ],
    practice: [
      {
        label: "5-4-3-2-1 grounding",
        detail:
          "Name five things you see, four you can feel, three you hear, two you smell, one you taste. It re-engages sensory cortex and interrupts the catastrophic thought loop — usable silently in a lecture hall.",
      },
      {
        label: "Small, deliberate exposure",
        detail:
          "Rank feared situations 0–10 and start at a 3, staying until the anxiety drops by roughly half. Repetition, not endurance of the worst case, is what rewires the response.",
      },
      {
        label: "Check the thought, not the feeling",
        detail:
          "Write the prediction ('I will freeze and everyone will notice'), then what actually happened. Over a fortnight the record itself becomes the counter-evidence.",
      },
      {
        label: "Protect sleep and caffeine",
        detail:
          "Caffeine after early afternoon and under six hours of sleep both lower the threshold for panic. Cutting the last coffee is often the single highest-yield change.",
      },
    ],
  },
  {
    icon: Users,
    title: "Relationships & social challenges",
    image: relationshipsImg,
    alt: "Three students talking supportively on campus steps",
    summary:
      "Loneliness at university is common and rarely means something is wrong with you — it usually means your routines have not yet produced repeated contact with the same people.",
    science:
      "Friendship forms mainly through propinquity and repeated unplanned contact, not through charisma. Research on friendship formation suggests dozens of hours of shared time before someone feels like a close friend — which is why a joined society beats ten one-off events. Loneliness also biases perception: it heightens vigilance for social rejection, making neutral faces read as cold, which then reduces approach behaviour.",
    signs: [
      "Feeling alone in a full room, or scrolling instead of messaging",
      "Recurring conflict with a roommate about the same unspoken issue",
      "Saying yes to everything, then resenting it",
      "A relationship where you monitor your words to avoid a reaction",
    ],
    practice: [
      {
        label: "Choose recurrence over novelty",
        detail:
          "One weekly fixture — a society, a lab group, a gym class, a church or mosque group — creates the repeated contact that friendship needs.",
      },
      {
        label: "The specific ask",
        detail:
          "'Coffee Thursday at 3 after the lecture?' converts far more often than 'we should hang out sometime'.",
      },
      {
        label: "Boundaries as a sentence",
        detail:
          "State the behaviour, the effect, the request: 'When dishes stay overnight, I can't cook before class. Could we clear ours the same evening?' Describe conduct, not character.",
      },
      {
        label: "Name the pattern early",
        detail:
          "Controlling, isolating or intimidating behaviour rarely improves without help. Talk to a counsellor before deciding what to do — you do not need to have made up your mind first.",
      },
    ],
  },
  {
    icon: HeartHandshake,
    title: "Bereavement & difficult life events",
    image: griefImg,
    alt: "A student walking alone on a tree-lined campus path at golden hour",
    summary:
      "Grief is not a queue of five stages. It arrives in waves, with ordinary days between them, and studying through it is genuinely hard.",
    science:
      "The dual-process model of bereavement describes healthy grieving as oscillation between loss-oriented time (feeling it, remembering) and restoration-oriented time (coursework, routines, life admin). Both are necessary; getting stuck in either is what causes trouble. Around one in ten bereaved people develop prolonged grief disorder — intense yearning and preoccupation persisting beyond twelve months with functional impairment — which responds to specific grief-focused therapy rather than time alone.",
    signs: [
      "Waves triggered by a song, a smell or a date, months later",
      "Concentration and memory noticeably worse than before",
      "Guilt about laughing, or about not crying",
      "After a year: still unable to engage with study or friendships",
    ],
    practice: [
      {
        label: "Tell your department early",
        detail:
          "Most universities have mitigating-circumstances, extension or deferral procedures. Requesting them is administrative, not a judgement on your ability, and is far easier before a deadline than after.",
      },
      {
        label: "Anchor two fixed points a day",
        detail:
          "One meal and one short walk at set times. Structure carries you when motivation cannot.",
      },
      {
        label: "Plan for anniversaries",
        detail:
          "Birthdays, funerals and holidays are predictable spikes. Decide in advance who you will be with and what you will do.",
      },
      {
        label: "Talk to someone outside the family",
        detail:
          "A counsellor or peer counsellor gives you a place where you do not have to manage anyone else's grief while expressing your own.",
      },
    ],
  },
  {
    icon: Sprout,
    title: "Academic burnout",
    summary:
      "Burnout is not the same as being tired. Rest fixes tired; burnout persists through the weekend because it is a response to prolonged demand without recovery or control.",
    science:
      "Burnout is defined by three dimensions — exhaustion, cynicism or detachment, and reduced sense of efficacy — measured in students by the Maslach Burnout Inventory–Student Survey. Job-demands–resources research shows it is driven less by workload alone than by the imbalance between demands and resources: autonomy, feedback, fairness, community and a sense that the work matters. Restoring one resource often helps more than removing hours.",
    signs: [
      "Dread rather than nerves on Sunday evening",
      "Cynicism about a subject you chose and used to love",
      "Doing the hours but producing little, then working longer to compensate",
      "Frequent minor illness, and rest that no longer restores",
    ],
    practice: [
      {
        label: "Audit resources, not just load",
        detail:
          "Ask which of autonomy, feedback, community and meaning has thinned. Adding a study group or a supervisor meeting can shift more than cutting a module.",
      },
      {
        label: "Real recovery, not passive collapse",
        detail:
          "Recovery research finds psychological detachment, relaxation, mastery and control are what restore. Six hours scrolling supplies none of them; two hours of sport, cooking or music supply most.",
      },
      {
        label: "Deliberately lower one standard",
        detail:
          "Choose one assignment to complete to 'good enough' rather than perfect. Perfectionism is a strong predictor of student burnout.",
      },
      {
        label: "Talk to your tutor before the wall",
        detail:
          "Reduced load, an intermission or a rescheduled deadline is far more available than most students assume.",
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Self-care & healthy coping",
    summary:
      "The unglamorous basics — sleep, food, movement, money and connection — carry most of the weight. They are also the first things to slip.",
    science:
      "Sleep is the highest-leverage variable: consistent 7–9 hours supports emotional regulation, and insomnia is both a symptom of and a risk factor for depression. Randomised trials show exercise produces clinically meaningful reductions in depressive symptoms, with roughly 150 minutes a week of moderate activity as a reasonable target. Alcohol used to sleep or to cope fragments REM sleep and worsens next-day anxiety — the rebound is pharmacological, not a character failing.",
    signs: [
      "Sleep and wake times drifting by hours across the week",
      "Skipping meals, then eating once late at night",
      "Drinking or using substances specifically to switch off",
      "Money worry you have not told anyone about",
    ],
    practice: [
      {
        label: "Fix the wake time first",
        detail:
          "A constant wake time plus morning daylight stabilises circadian rhythm faster than trying to force an earlier bedtime.",
      },
      {
        label: "Eat on a schedule, not on appetite",
        detail:
          "Stress suppresses hunger cues. Three routine meals with protein steadies energy and mood more reliably than waiting to feel hungry.",
      },
      {
        label: "Movement you would actually repeat",
        detail:
          "Football, dancing, walking to campus. Adherence matters more than intensity.",
      },
      {
        label: "Ask about hardship funds",
        detail:
          "Financial strain is one of the strongest predictors of student distress. Hardship funds, bursaries and our financial-assistance request exist precisely for this.",
      },
    ],
  },
];

const emergency = [
  { label: "Kenya Red Cross emotional support", detail: "1199 · free, 24 hours" },
  { label: "Befrienders Kenya", detail: "+254 722 178 177" },
  { label: "Emergency services", detail: "999 / 112" },
  { label: "Campus Wellbeing Centre", detail: "Gate 4 · Mon–Fri, 8am–6pm" },
];

function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free to read, no sign-up"
        title="Mental health resources for student life"
        intro="Reading something is a legitimate first step. These guides are grounded in evidence, written for the realities of campus, and short enough to finish between lectures."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {guides.map(({ icon: Icon, title, image, alt, summary, science, signs, practice }, i) => (
            <article
              key={title}
              className="overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-shadow hover:shadow-lg"
            >
              {image ? (
                <img
                  src={image}
                  alt={alt ?? title}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-52 w-full object-cover"
                />
              ) : null}
              <div className="p-7">
                <span
                  className={`grid size-10 place-items-center rounded-full text-primary-deep ${
                    i % 2 === 0 ? "bg-primary/10" : "bg-accent/15"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-2xl font-medium">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {summary}
                </p>

                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="science" className="border-border">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      What the evidence says
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground text-pretty">
                      {science}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="signs" className="border-border">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      Signs students notice
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                        {signs.map((s) => (
                          <li key={s}>— {s}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="practice" className="border-b-0 border-border">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      What actually helps
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3">
                        {practice.map((p) => (
                          <li key={p.label} className="rounded-2xl bg-secondary/50 p-4">
                            <p className="text-sm font-medium">{p.label}</p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                              {p.detail}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-2">
          <div>
            <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary-deep">
              <Stethoscope className="size-5" />
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-balance">
              When to seek professional help
            </h2>
            <p className="mt-3 text-base text-muted-foreground text-pretty">
              Clinical thresholds are not mysterious. Reach out to a professional if any of these
              have lasted more than two weeks, or if they are getting in the way of your day.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              <li>— Low mood or loss of interest on most days for two weeks or more.</li>
              <li>— You cannot sleep, or you cannot get out of bed.</li>
              <li>— Anxiety, dread or panic that is shaping what you will and will not do.</li>
              <li>— You are using alcohol or substances to cope, or using more than before.</li>
              <li>— Eating has become something you control, restrict or hide.</li>
              <li>— Any thought of harming yourself — this one has no waiting period.</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
              Counsellors commonly use brief screening questionnaires such as the PHQ-9 for mood
              and the GAD-7 for anxiety. They are conversation starters, not verdicts, and you will
              see and discuss your own answers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="pill-lg">
                <Link to="/book">Book a Session</Link>
              </Button>
              <Button asChild variant="soft" size="pill-lg">
                <Link to="/peer-counselling">Talk to a Peer</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl bg-urgent-soft p-7 ring-1 ring-urgent/30">
            <div className="flex items-center gap-2.5 text-urgent-foreground">
              <LifeBuoy className="size-5" />
              <h2 className="text-2xl font-medium">Emergency & professional services</h2>
            </div>
            <ul className="mt-5 space-y-3">
              {emergency.map((e) => (
                <li key={e.label} className="rounded-2xl bg-card p-4 ring-1 ring-border">
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{e.detail}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/get-help"
              className="mt-5 inline-flex text-sm font-semibold text-urgent-foreground underline underline-offset-4"
            >
              See all urgent support options &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
