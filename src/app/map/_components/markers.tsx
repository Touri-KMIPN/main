import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useState, useRef, useCallback, useEffect } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { Spot, PlaceType } from "@/types/spot";
import { getPlaceIcon } from "@/lib/place-icons";
import SpotCard from "@/components/spot-card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

// pins
const PoiMarkers = (props: { pois: Spot[] }) => {
  // map clusterer
  const map = useMap();

  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});

  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  // user interaction
  const handleClick = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      if (!map) return;
      if (!ev.latLng) return;
      // action when marker clicked
      map.panTo(ev.latLng);
    },
    [map]
  );

  return (
    <>
      {props.pois.map((poi, idx) => {
        // Get the primary type (first type) for icon
        const primaryType = poi.types[0] as PlaceType;
        const Icon = getPlaceIcon(primaryType);

        return (
          <AdvancedMarker
            key={idx}
            position={{
              lat: poi.location.latitude,
              lng: poi.location.longitude,
            }}
            ref={(marker) => setMarkerRef(marker, poi.displayName.text)}
            onClick={handleClick}
            clickable={true}
          >
              <HoverCard>
                <HoverCardTrigger>
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2 rounded-full border border-border bg-white text-black shadow-lg">
                      <Icon className="size-4" />
                    </div>
                    <p className="bg-background px-1 rounded-lg text-xs text-center font-medium max-w-[200px]">
                      {poi.displayName.text.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="bg-background p-0" side="right">
                    <SpotCard spot={poi} />
                </HoverCardContent>
              </HoverCard>
          </AdvancedMarker>
        );
      })}
    </>
  );
};
export default PoiMarkers;
