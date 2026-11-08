import Link from "next/link";
import { BodyIcon } from "@/components/BodyIcon";

const STEPS = [
  { emoji: "💬", title: "Answer simple questions", text: "About your life, budget and dreams. No car jargon." },
  { emoji: "🎯", title: "Get 3–5 matches", text: "Each with plain-English reasons and one honest downside." },
  { emoji: "💶", title: "See the real cost", text: "Motor tax, fuel and, for Northern Ireland cars, VRT and every extra." },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Find a car that fits your life.
          </h1>
          <p className="text-lg text-slate-600">
            Don't know anything about cars? Perfect. Answer a few everyday questions and we'll suggest cars that suit
            your budget, your roads and your dreams, here in Ireland or across the border in Northern Ireland.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/quiz/" className="btn-primary text-lg">
              Start the quiz <span className="font-normal opacity-80">(about 4 min)</span>
            </Link>
            <Link href="/quiz/?mode=quick" className="btn-secondary">
              Quick mode (90 sec)
            </Link>
          </div>
          <p className="text-sm text-slate-500">Free · No sign-up · Your answers stay on your device</p>
        </div>
        <div className="grid grid-cols-3 gap-3" aria-hidden="true">
          {(["supermini", "crossover", "estate", "sports", "suv", "city"] as const).map((b, i) => (
            <div key={b} className="card flex items-center justify-center p-3">
              <BodyIcon
                body={b}
                className="h-14 w-full"
                color={["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"][i]}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="card p-5">
            <div className="text-3xl">{s.emoji}</div>
            <h2 className="mt-2 font-semibold">{s.title}</h2>
            <p className="text-slate-600">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="card space-y-3 bg-brand-50 p-6">
        <h2 className="text-xl font-bold">Thinking of buying in Northern Ireland?</h2>
        <p className="text-slate-700">
          Cars there are often cheaper, but you'll pay VRT and need some paperwork. We add up the total cost of getting
          the car on the road in the Republic and only suggest it if you'd still save.
        </p>
        <Link href="/northern-ireland/" className="btn-secondary">
          See the steps and costs
        </Link>
      </section>
    </div>
  );
}
