import PHOTOS from "@/data/carPhotos.json";
import { CarArt, carColour } from "@/components/ui/CarArt";
import type { Car } from "@/lib/types";

export interface PhotoCredit {
  file: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
  title?: string;
}

const photos = PHOTOS as Record<string, PhotoCredit>;

export function photoFor(car: Car): PhotoCredit | undefined {
  return photos[car.id];
}

/**
 * A real photo of the car (freely licensed, from Wikimedia Commons, stored with
 * the app and credited as the licence requires). Falls back to our illustration.
 */
export function CarPhoto({
  car,
  className = "",
  credit = false,
  priority = false,
}: {
  car: Car;
  className?: string;
  /** Show the photographer credit under the photo. */
  credit?: boolean;
  priority?: boolean;
}) {
  const p = photoFor(car);
  if (!p) {
    return <CarArt body={car.body} color={carColour(car.id)} className={`${className} text-ink`} />;
  }
  return (
    <figure className="flex h-full w-full flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/cars/${p.file}`}
        alt={`Photo of a ${car.make} ${car.model}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`min-h-0 w-full flex-1 rounded-xl object-cover ${className}`}
      />
      {credit && <PhotoCreditLine p={p} />}
    </figure>
  );
}

export function PhotoCreditLine({ p }: { p: PhotoCredit }) {
  return (
    <figcaption className="mt-1.5 text-[11px] leading-tight text-muted">
      Photo:{" "}
      <a href={p.source} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-ink">
        {p.author}
      </a>
      ,{" "}
      {p.licenseUrl ? (
        <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-ink">
          {p.license}
        </a>
      ) : (
        p.license
      )}
      , via Wikimedia Commons
    </figcaption>
  );
}
