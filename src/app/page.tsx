"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  Map,
  CalendarDays,
  ScrollText,
  MessagesSquare,
  Layers,
  BarChart3,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  GraduationCap,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CERTIFICATIONS } from "@/constants/certifications";
import { LandingNav } from "@/features/landing/landing-nav";

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const VIEWPORT = { once: true, amount: 0.2 } as const;

/* ------------------------------------------------------------------ */
/* Static content                                                      */
/* ------------------------------------------------------------------ */

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Map,
    title: "Personalized Roadmaps",
    description:
      "AI builds a roadmap shaped around your exam, your timeline, and the hours you can actually commit.",
  },
  {
    icon: CalendarDays,
    title: "Day-Wise Plans",
    description:
      "Every day comes with topics, a time budget, a hands-on lab, practice questions, and revision.",
  },
  {
    icon: ScrollText,
    title: "Cheat Sheets",
    description:
      "Condensed, exam-ready cheat sheets for each domain so the night-before review is effortless.",
  },
  {
    icon: MessagesSquare,
    title: "Interview Prep",
    description:
      "Turn certification knowledge into job-ready answers with curated interview questions.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description:
      "Spaced-repetition flashcards generated from your roadmap to lock concepts into memory.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "A readiness score and progress dashboard show exactly how close you are to passing.",
  },
];

type ValueProp = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const VALUE_PROPS: ValueProp[] = [
  {
    icon: Zap,
    title: "Fast to start",
    description:
      "Pick a certification, set your pace, and get a complete plan in seconds — no setup wizard.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Bring your own AI key. Generation happens with your key and your data never leaves your device.",
  },
  {
    icon: Check,
    title: "Offline-first",
    description:
      "Roadmaps, questions, and flashcards are stored locally so you can study anywhere, account-free.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      <main>
        <Hero />
        <FeaturesSection />
        <RoadmapPreview />
        <CertificationsSection />
        <WhyStrip />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* dotted grid background layer */}
      <div className="card-grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      {/* glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 blur-3xl" />

      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full border border-border px-3 py-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered certification roadmaps
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          Pass Certifications Faster With{" "}
          <span className="gradient-text">Personalized AI Roadmaps</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
        >
          CertPath AI turns any certification into a day-by-day study plan —
          complete with practice questions, flashcards, cheat sheets, and
          interview prep. Everything is generated for your timeline and stored
          locally, so there is nothing to sign up for.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild variant="gradient" size="lg" className="w-full sm:w-auto">
            <Link href="/generate">
              <Sparkles className="h-5 w-5" />
              Generate My Roadmap
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-sm text-muted-foreground"
        >
          No account needed · Runs on your own API key · Works offline
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Everything in one place"
          title="A complete exam-prep workspace"
          description="From the first study day to your final review, CertPath AI generates everything you need to pass — and keeps it organized."
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                  <CardHeader>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary ring-1 ring-inset ring-primary/15 transition-colors group-hover:from-primary/20 group-hover:to-purple-500/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="mt-4 text-lg">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Roadmap preview (faux product screenshot)                           */
/* ------------------------------------------------------------------ */

function RoadmapPreview() {
  const topics = ["VPC", "NAT Gateway", "Route Tables"];

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="See it in action"
          title="Your study, planned to the day"
          description="No more guessing what to learn next. Each day is scoped, timed, and reinforced with hands-on practice."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="relative mx-auto mt-14 max-w-3xl"
        >
          {/* glow behind the mock */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 blur-2xl" />

          <Card className="relative overflow-hidden shadow-xl">
            {/* fake window chrome */}
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-destructive/60" />
              <span className="h-3 w-3 rounded-full bg-warning/70" />
              <span className="h-3 w-3 rounded-full bg-success/70" />
              <span className="ml-3 text-xs font-medium text-muted-foreground">
                AWS Solutions Architect Associate · 8-week plan
              </span>
            </div>

            <CardContent className="space-y-6 p-6">
              {/* header row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <span className="text-[10px] font-semibold uppercase leading-none">
                      Day
                    </span>
                    <span className="text-lg font-bold leading-tight">14</span>
                  </span>
                  <div>
                    <p className="font-semibold">Networking on AWS</p>
                    <p className="text-sm text-muted-foreground">
                      Design Resilient Architectures
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />2 hours
                </Badge>
              </div>

              {/* topics */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <Badge key={topic} variant="outline" className="gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" />
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* checklist grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MockTile
                  icon={Zap}
                  label="Hands-on lab"
                  value="Build a VPC"
                />
                <MockTile
                  icon={MessagesSquare}
                  label="Practice"
                  value="20 questions"
                />
                <MockTile
                  icon={Layers}
                  label="Revision"
                  value="IAM"
                />
              </div>

              {/* progress bar */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Day progress</span>
                  <span>72%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            A glimpse of your daily plan
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function MockTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Certifications                                                      */
/* ------------------------------------------------------------------ */

function CertificationsSection() {
  return (
    <section
      id="certifications"
      className="scroll-mt-20 border-y border-border bg-muted/20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Pick your path"
          title="Built for the certifications that matter"
          description="Start with a fully supported track today — more are on the way. Every roadmap adapts to the exam's real domains and weightings."
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CERTIFICATIONS.map((cert) => (
            <motion.div key={cert.id} variants={fadeUp}>
              <CertCard cert={cert} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CertCard({
  cert,
}: {
  cert: (typeof CERTIFICATIONS)[number];
}) {
  const card = (
    <Card
      className={cn(
        "group relative h-full overflow-hidden transition-all duration-300",
        cert.available
          ? "hover:-translate-y-1 hover:shadow-lg"
          : "opacity-90",
      )}
    >
      {/* accent top border */}
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: cert.color }}
        aria-hidden
      />

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: cert.color }}
            aria-hidden
          >
            {cert.code.slice(0, 2)}
          </span>
          {cert.available ? (
            <Badge variant="success">Available</Badge>
          ) : (
            <Badge variant="warning">Coming soon</Badge>
          )}
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {cert.provider} · {cert.code}
        </p>
        <CardTitle className="mt-1 text-lg leading-snug">{cert.name}</CardTitle>
        <CardDescription className="leading-relaxed">
          {cert.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        <Badge variant="secondary" className="capitalize">
          {cert.level}
        </Badge>
        <span className="text-xs text-muted-foreground">
          ~{cert.recommendedHours} hrs
        </span>
      </CardContent>

      {cert.available && (
        <span className="pointer-events-none absolute bottom-4 right-4 flex h-8 w-8 translate-x-1 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </Card>
  );

  if (cert.available) {
    return (
      <Link
        href="/generate"
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`Generate a roadmap for ${cert.name}`}
      >
        {card}
      </Link>
    );
  }

  return card;
}

/* ------------------------------------------------------------------ */
/* Why strip                                                           */
/* ------------------------------------------------------------------ */

function WhyStrip() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Why CertPath AI"
          title="Powerful, private, and out of your way"
          description="A study tool that respects your time and your data."
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                variants={fadeUp}
                className="text-center sm:text-left"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-white shadow-md shadow-primary/25">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{prop.title}</h3>
                <p className="mt-2 text-pretty text-muted-foreground">
                  {prop.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-500 to-purple-500 px-6 py-16 text-center shadow-2xl shadow-primary/20 sm:px-12 sm:py-20"
      >
        <div className="card-grid-bg pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your certification roadmap is one click away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-white/85">
            Generate a personalized, day-by-day plan now. No account, no
            credit card — just bring your own AI key and start studying.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary shadow-lg hover:bg-white/90"
            >
              <Link href="/generate">
                <Sparkles className="h-5 w-5" />
                Generate My Roadmap
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-indigo-500 to-purple-500 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight">CertPath AI</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Runs fully on-device. Bring your own AI key.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:items-end">
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link
              href="#certifications"
              className="transition-colors hover:text-foreground"
            >
              Certifications
            </Link>
            <Link
              href="#"
              aria-label="GitHub"
              className="transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CertPath AI. Study smarter, not harder.
          </p>
        </div>
      </div>
    </footer>
  );
}
