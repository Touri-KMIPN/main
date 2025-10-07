import { Spot } from "@/types/spot";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MapIcon } from "lucide-react";

export default function SpotCard({ spot }: { spot?: Spot }) {
  const thumbnailUri = React.useMemo(() => {
    if (spot?.photos && spot.photos.length > 0) {
      const requestParams = new URLSearchParams({
        name: spot.photos[0].name || "",
        maxHeightPx: "640",
      });
      return (
        "/api/resource/place/image" + "?" + requestParams.toString() ||
        "/placeholder.svg"
      );
    }

    return null;
  }, [spot]);

  return (
    <div>
      {spot ? (
        <div className="flex flex-col gap-3 max-w-sm overflow-hidden">
          <div className="h-full w-full aspect-square shrink-0 overflow-hidden rounded-md bg-muted">
            {spot.photos ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUri || "/placeholder.svg"}
                alt={"Photo of " + spot.displayName.text}
                className="w-full aspect-square object-cover"
              />
            ) : (
              // placeholder image
              // Using required pattern per design guidelines
              // solid placeholder uses the placeholder.svg helper
              // height/width hard-coded (no string concatenation)
              // query hard-coded for alt generation
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/place-thumbnail.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 p-3">
            <div className="font-bold text-primary leading-tight text-pretty">
              {spot.displayName.text}
            </div>
            {typeof spot.rating === "number" && (
              <div className="mt-0.5 text-sm text-muted-foreground">
                Rating: {spot.rating.toFixed(1)} / 5
              </div>
            )}
            {spot.formattedAddress && (
              <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {spot.formattedAddress}
              </div>
            )}
            {spot.googleMapsUri && (
              <Link href={spot.googleMapsUri}>
                <Button size="sm" className="mt-3 w-full">
                  <MapIcon />
                  Open in Maps
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No details available for this spot.
        </div>
      )}
    </div>
  );
}
