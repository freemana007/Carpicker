import { UpcomingCard } from "@/components/Upcoming";
import { UPCOMING, UPCOMING_CHECKED } from "@/data/upcoming";
import { formatDate } from "@/data/financeOffers";

export const metadata = { title: "Coming soon · CarPicker Ireland" };

export default function ComingSoonPage() {
  const irish = UPCOMING.filter((u) => u.status === "irish-site");
  const europe = UPCOMING.filter((u) => u.status === "europe");
  return (
    <div className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl md:text-5xl">Coming soon</h1>
        <p className="text-lg text-ink/80">
          New cars on their way. They aren&apos;t in your shortlist yet because there are no confirmed Irish prices, but it
          can be worth waiting if one of these suits you.
        </p>
        <p className="text-sm text-muted">Last checked {formatDate(UPCOMING_CHECKED)}.</p>
      </div>
      <section aria-labelledby="irish">
        <h2 id="irish" className="text-2xl">
          Confirmed for Ireland
        </h2>
        <p className="mb-4 mt-1 text-muted">Shown as coming soon on the brand&apos;s Irish website.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {irish.map((u) => (
            <UpcomingCard key={u.id} u={u} />
          ))}
        </div>
      </section>
      <section aria-labelledby="europe">
        <h2 id="europe" className="text-2xl">
          Launched in Europe, Ireland to be confirmed
        </h2>
        <p className="mb-4 mt-1 text-muted">In production in 2026, but not yet confirmed or priced for Ireland.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {europe.map((u) => (
            <UpcomingCard key={u.id} u={u} />
          ))}
        </div>
      </section>
    </div>
  );
}
