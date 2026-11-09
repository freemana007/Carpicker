import { CalendarClock, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import PHOTOS from "@/data/carPhotos.json";
import type { UpcomingCar } from "@/data/upcoming";
import { PhotoCreditLine, type PhotoCredit } from "@/components/ui/CarPhoto";
import { CarArt, carColour } from "@/components/ui/CarArt";

const photos = PHOTOS as Record<string, PhotoCredit>;
const ENGINE = { ev: "Electric", hybrid: "Hybrid", phev: "Plug-in hybrid", petrol: "Petrol", diesel: "Diesel" };

export function UpcomingCard({ u, compact = false }: { u: UpcomingCar; compact?: boolean }) {
  const p = photos[u.id];
  return (
    <article className="card flex h-full flex-col p-5">
      <div className={`flex items-center justify-center overflow-hidden rounded-2xl bg-surface-2/70 ${compact ? "h-28" : "h-40"}`}>
        {p ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/cars/${p.file}`} alt={`Photo of a ${u.make} ${u.model}`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <CarArt body={u.body} color={carColour(u.id)} className="h-full p-3 text-ink" />
        )}
      </div>
      {p && !compact && <PhotoCreditLine p={p} />}
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">Coming soon</span>
        <span className="text-muted">{ENGINE[u.powertrain]}</span>
      </p>
      <h3 className="mt-1 text-lg">
        {u.make} {u.model}
      </h3>
      <p className="mt-1 flex-1 text-sm text-ink/80">{u.summary}</p>
      {!compact && (
        <p className="mt-3 flex gap-1.5 text-sm">
          {u.status === "irish-site" ? (
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-hidden="true" />
          ) : (
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          )}
          <span>{u.timing}</span>
        </p>
      )}
      <a href={u.source.url} target="_blank" rel="noreferrer" className="link mt-3 inline-flex min-h-11 items-center gap-1 text-sm">
        {u.source.label} <ExternalLink className="h-3.5 w-3.5" aria-label="(opens in a new tab)" />
      </a>
      {compact && (
        <Link href="/coming-soon/" className="link inline-flex min-h-11 items-center text-sm">
          All coming-soon cars
        </Link>
      )}
    </article>
  );
}
