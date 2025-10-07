"use client";

import { Spot } from "@/types/spot";
import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Map } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import SpotCard from "../spot-card";

type HoverSpotProps = {
  label: string;
  spot?: Spot;
};

/**
 * Accessible hover/focus card that appears when the word is hovered or focused.
 * Works with keyboard (focus) and pointer (hover).
 */
export function HoverSpot({ label, spot }: HoverSpotProps) {
  const [open, setOpen] = React.useState(false);

  const containerRef = React.useRef<HTMLSpanElement>(null);
  const popoverId = React.useId();

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
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="px-1 underline decoration-dotted hover:cursor-help rounded-lg hover:bg-muted">
          {label}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="bg-accent/80 backdrop-blur-sm" side="right">
        <SpotCard spot={spot} />
      </HoverCardContent>
    </HoverCard>
  );
}
