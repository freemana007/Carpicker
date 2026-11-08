import { ArrowRight, Calculator, Filter, Gift, ListChecks, MapPin, MessageCircle, ShieldCheck, Smartphone, UserX } from "lucide-react";
import Link from "next/link";
import { ResumeLink } from "@/components/ResumeLink";
import { CarArt } from "@/components/ui/CarArt";

const TRUST = [
  { icon: Gift, text: "Free" },
  { icon: UserX, text: "No account" },
  { icon: Smartphone, text: "Your answers stay on your phone" },
];

const HOW = [
  { icon: MessageCircle, title: "You tell us about your life", text: "Budget, family, roads, what you love. No car words needed." },
  { icon: Filter, title: "We filter and score 50+ cars", text: "Using fixed, open rules. No AI, no ads, no paid placements." },
  { icon: ListChecks, title: "You get a shortlist, with reasons", text: "Your best match, plus a few alternatives, each with one honest downside." },
];

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium">
            <MapPin className="h-4 w-4 text-brand" aria-hidden="true" /> Made for drivers in Ireland
          </p>
          <h1 className="text-5xl leading-[1.05] md:text-6xl">
            Find a car that fits your life.
          </h1>
          <p className="text-xl text-ink/80">In about 3 minutes. No car knowledge needed.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/quiz/" className="btn-primary min-h-14 px-8 text-lg">
              Start <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/quiz/?mode=quick" className="link">
              In a hurry? 90-second version
            </Link>
          </div>
          <ResumeLink />
          <ul className="flex flex-wrap gap-2" aria-label="Our promises">
            {TRUST.map((t) => (
              <li key={t.text} className="chip">
                <t.icon className="h-4 w-4 text-brand" aria-hidden="true" /> {t.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative" aria-hidden="true">
          <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-brand-soft to-surface-2" />
          <div className="relative grid grid-cols-2 gap-4 p-8">
            <CarArt body="crossover" color="#0f766e" className="col-span-2 w-full text-ink" />
            <CarArt body="supermini" color="#d97706" className="w-full text-ink" />
            <CarArt body="estate" color="#2563eb" className="w-full text-ink" />
          </div>
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="text-3xl">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {HOW.map((h, i) => (
            <li key={h.title} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <h.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold text-muted">Step {i + 1}</p>
              <h3 className="text-xl">{h.title}</h3>
              <p className="mt-2 text-ink/80">{h.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card grid items-center gap-6 p-8 md:grid-cols-[auto_1fr_auto]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Calculator className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl">Thinking of buying in Northern Ireland?</h2>
          <p className="mt-1 text-ink/80">
            We add up VRT, travel and every extra, and only suggest it if you&apos;d still save. Plus the exact steps, checked
            with Revenue.
          </p>
        </div>
        <Link href="/northern-ireland/" className="btn-secondary">
          Work it out
        </Link>
      </section>

      <section className="flex items-start gap-3 text-muted">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <p>
          Buying a car is a big decision. Take your time: your answers are saved on this device, there&apos;s no countdown,
          and nobody will email you.
        </p>
      </section>
    </div>
  );
}
