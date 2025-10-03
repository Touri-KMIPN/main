"use client"

import * as React from "react"

export type Spot = {
  id: string
  name: string
  address?: string
  rating?: number
  googleMapsUri?: string
  imageUrl?: string
}

type HoverSpotProps = {
  label: string
  spot?: Spot
}

/**
 * Accessible hover/focus card that appears when the word is hovered or focused.
 * Works with keyboard (focus) and pointer (hover).
 */
export function HoverSpot({ label, spot }: HoverSpotProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLSpanElement>(null)
  const popoverId = React.useId()

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        className="underline decoration-dotted underline-offset-2 cursor-help text-primary hover:text-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring px-0.5 rounded-sm"
      >
        {label}
      </button>

      {open && (
        <div
          role="dialog"
          id={popoverId}
          className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border bg-card text-foreground shadow-md"
        >
          <div className="p-3">
            {spot ? (
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {spot.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={spot.imageUrl || "/placeholder.svg"}
                      alt={"Photo of " + spot.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // placeholder image
                    // Using required pattern per design guidelines
                    // solid placeholder uses the placeholder.svg helper
                    // height/width hard-coded (no string concatenation)
                    // query hard-coded for alt generation
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/place-thumbnail.jpg" alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium leading-tight text-pretty">{spot.name}</div>
                  {typeof spot.rating === "number" && (
                    <div className="mt-0.5 text-sm text-muted-foreground">Rating: {spot.rating.toFixed(1)} / 5</div>
                  )}
                  {spot.address && (
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{spot.address}</div>
                  )}
                  {spot.googleMapsUri && (
                    <div className="mt-2">
                      <a
                        href={spot.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No details available for this spot.</div>
            )}
          </div>
        </div>
      )}
    </span>
  )
}
