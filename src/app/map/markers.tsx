import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps"
import { useState, useRef, useCallback, useEffect } from "react"
import { MarkerClusterer } from "@googlemaps/markerclusterer"
import type { Marker } from "@googlemaps/markerclusterer"
import { UtensilsCrossed } from "lucide-react"
import { Spot } from "@/types/spot"

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
      console.log("marker clicked: ", ev.latLng.toString());
      // action when marker clicked
      map.panTo(ev.latLng);
    },
    [map]
  );

  return (
    <>
      {props.pois.map((poi, idx) => (
        <AdvancedMarker
          key={idx}
          position={{lat: poi.location.latitude, lng: poi.location.longitude,}}
          ref={(marker) => setMarkerRef(marker, poi.displayName.text)}
          onClick={handleClick}
          clickable={true}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="bg-background p-2 rounded-full border">
              <UtensilsCrossed className="size-4" />
            </div>
            <p className="bg-background px-1 rounded-lg">
              {poi.displayName.text.replace(/([A-Z])/g, " $1").trim()}
            </p>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
};
export default PoiMarkers;
