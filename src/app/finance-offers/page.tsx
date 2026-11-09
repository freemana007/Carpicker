import { FinanceOffersList } from "@/components/FinanceOffersList";
import { Term } from "@/components/Term";
import { OFFERS_CHECKED, formatDate } from "@/data/financeOffers";

export const metadata = { title: "0% finance offers · CarPicker Ireland" };

export default function FinanceOffersPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl">0% finance offers</h1>
        <p className="text-lg text-ink/80">
          Car brands sometimes pay the interest for you on new cars, so you pay back only the price of the car. Here are the
          0% offers we could confirm on each brand&apos;s own Irish website.
        </p>
        <p className="text-sm text-muted">
          Last checked {formatDate(OFFERS_CHECKED)}. Offers change every month and disappear from this page after they end.
          Always read the brand&apos;s full terms.
        </p>
      </div>

      <section className="rounded-2xl bg-info-soft p-5 text-sm">
        <h2 className="text-base font-semibold">Before you sign up for 0%</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>It&apos;s for <strong>new cars only</strong>, through the brand&apos;s own finance company, and subject to approval.</li>
          <li>You usually need a <strong>big deposit</strong> (often 30% or more). A trade-in can count towards it.</li>
          <li>
            With <Term term="PCP" /> there&apos;s a large final &quot;balloon&quot; payment if you want to keep the car. With{" "}
            <Term term="Hire purchase" /> you own it after the last payment.
          </li>
          <li>0% isn&apos;t always cheapest: ask what discount you&apos;d get for cash or a credit union loan, then compare.</li>
          <li>Offers from dealers in the Republic usually aren&apos;t available if you buy in Northern Ireland.</li>
        </ul>
      </section>

      <FinanceOffersList />
    </div>
  );
}
