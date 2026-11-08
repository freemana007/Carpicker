import PHOTOS from "@/data/carPhotos.json";
import { PhotoCreditLine, type PhotoCredit } from "@/components/ui/CarPhoto";
import { CARS } from "@/data/cars";

export const metadata = { title: "Photo credits · CarPicker Ireland" };

export default function CreditsPage() {
  const photos = PHOTOS as Record<string, PhotoCredit>;
  const withPhotos = CARS.filter((c) => photos[c.id]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-4xl">Photo credits</h1>
      <p className="text-ink/80">
        Car photos are freely licensed images from Wikimedia Commons, shared by their photographers. Thank you! Each is used
        under the licence shown. They show the model in general, not a specific car for sale, and colours or versions may
        differ.
      </p>
      {withPhotos.length === 0 ? (
        <p className="text-muted">No photos yet: the app is showing illustrations.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {withPhotos.map((c) => (
            <li key={c.id} className="card p-4">
              <p className="font-semibold">
                {c.make} {c.model}
              </p>
              <PhotoCreditLine p={photos[c.id]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
