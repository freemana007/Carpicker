"use client";

import { BadgePercent, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate, offerFor, type FinanceOffer } from "@/data/financeOffers";
import type { Car } from "@/lib/types";

/** Offers depend on today's date, so they're worked out in the browser. */
function useOffer(car: Car): FinanceOffer | undefined {
  const [offer, setOffer] = useState<FinanceOffer | undefined>(undefined);
  useEffect(() => setOffer(offerFor(car)), [car]);
  return offer;
}

export function FinanceBadge({ car }: { car: Car }) {
  const offer = useOffer(car);
  if (!offer) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-2.5 py-1 text-xs font-semibold text-good">
      <BadgePercent className="h-3.5 w-3.5" aria-hidden="true" /> 0% finance on new
    </span>
  );
}

export function FinanceOfferBox({ car }: { car: Car }) {
  const offer = useOffer(car);
  if (!offer) return null;
  return (
    <div className="rounded-2xl bg-good-soft/60 p-4">
      <p className="flex items-center gap-2 font-semibold">
        <BadgePercent className="h-5 w-5 text-good" aria-hidden="true" />
        {offer.brand} is offering 0% {offer.type} finance on new {car.model}s
      </p>
      <p className="mt-1 text-sm text-ink/80">
        {offer.detail} {offer.dates}
        {offer.minDepositPct ? ` Minimum deposit about ${offer.minDepositPct}%.` : ""}
      </p>
      <p className="mt-2 flex gap-1.5 text-xs text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        New cars only, from {offer.brand}&apos;s own finance company, subject to approval. With PCP there&apos;s a large
        final payment if you want to keep the car. Ask what discount you&apos;d get paying cash instead.
      </p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a href={offer.source} target="_blank" rel="noreferrer" className="link inline-flex min-h-10 items-center gap-1">
          See {offer.brand}&apos;s offer <ExternalLink className="h-3.5 w-3.5" aria-label="(opens in a new tab)" />
        </a>
        <Link href="/finance-offers/" className="link inline-flex min-h-10 items-center">
          All 0% offers
        </Link>
      </p>
      <p className="text-xs text-muted">Checked on {formatDate(offer.checked)}.</p>
    </div>
  );
}
