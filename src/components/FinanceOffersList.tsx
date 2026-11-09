"use client";

import { BadgePercent, CalendarClock, ExternalLink, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { OFFERS_NOT_CONFIRMED, formatDate, liveOffers, type FinanceOffer } from "@/data/financeOffers";

export function FinanceOffersList() {
  const [offers, setOffers] = useState<FinanceOffer[] | null>(null);
  useEffect(() => setOffers(liveOffers()), []);
  if (!offers) return <p className="text-muted">Loading offers…</p>;
  return (
    <div className="space-y-8">
      {offers.length === 0 ? (
        <p className="card p-6">No confirmed 0% offers right now. Check back soon, or look at the brands below.</p>
      ) : (
        <ul className="space-y-4">
          {offers.map((o) => (
            <li key={o.brand} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl">
                  <BadgePercent className="h-6 w-6 text-good" aria-hidden="true" /> {o.brand}
                </h2>
                <span className="chip font-semibold">0% {o.type}</span>
              </div>
              <p className="mt-3">
                <strong>Models:</strong> {o.models.join(", ")}
              </p>
              <p className="mt-2 text-ink/80">{o.detail}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                {o.termMonths && (
                  <div className="rounded-xl bg-surface-2/60 p-3">
                    <dt className="text-muted">Term</dt>
                    <dd className="font-semibold">{o.termMonths} months</dd>
                  </div>
                )}
                {o.minDepositPct && (
                  <div className="rounded-xl bg-surface-2/60 p-3">
                    <dt className="text-muted">Minimum deposit</dt>
                    <dd className="font-semibold">About {o.minDepositPct}%</dd>
                  </div>
                )}
                <div className="rounded-xl bg-surface-2/60 p-3">
                  <dt className="flex items-center gap-1 text-muted">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> Ends
                  </dt>
                  <dd className="font-semibold">{o.validUntil ? formatDate(o.validUntil) : "No end date shown"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-muted">{o.dates}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <a href={o.source} target="_blank" rel="noreferrer" className="link inline-flex min-h-11 items-center gap-1">
                  See the offer and full terms on {o.brand}&apos;s website <ExternalLink className="h-3.5 w-3.5" aria-label="(opens in a new tab)" />
                </a>
                <span className="text-xs text-muted">Checked {formatDate(o.checked)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="not-checked" className="card p-6">
        <h2 id="not-checked" className="flex items-center gap-2 text-xl">
          <HelpCircle className="h-5 w-5 text-muted" aria-hidden="true" /> Other brands
        </h2>
        <ul className="mt-3 space-y-3">
          {OFFERS_NOT_CONFIRMED.map((n) => (
            <li key={n.brand}>
              <strong>{n.brand}:</strong> <span className="text-ink/80">{n.reason}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
