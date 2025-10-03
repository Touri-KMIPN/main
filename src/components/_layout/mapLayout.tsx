"use client";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
  type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker } from "@googlemaps/markerclusterer";
import { UtensilsCrossed } from "lucide-react";

type Poi = { key: string; location: google.maps.LatLngLiteral };
interface MapWithMarkersProps {
  pois: Poi[];
}
const locations: Poi[] = [
  { key: "operaHouse", location: { lat: -2.9833, lng: 104.7644 } },
  { key: "tarongaZoo", location: { lat: -33.8472767, lng: 151.2188164 } },
  { key: "manlyBeach", location: { lat: -33.8209738, lng: 151.2563253 } },
  { key: "hyderPark", location: { lat: -33.8690081, lng: 151.2052393 } },
  { key: "theRocks", location: { lat: -33.8587568, lng: 151.2058246 } },
  { key: "circularQuay", location: { lat: -33.858761, lng: 151.2055688 } },
  { key: "harbourBridge", location: { lat: -33.852228, lng: 151.2038374 } },
  { key: "kingsCross", location: { lat: -33.8737375, lng: 151.222569 } },
  { key: "botanicGardens", location: { lat: -33.864167, lng: 151.216387 } },
  { key: "museumOfSydney", location: { lat: -33.8636005, lng: 151.2092542 } },
  { key: "maritimeMuseum", location: { lat: -33.869395, lng: 151.198648 } },
  { key: "kingStreetWharf", location: { lat: -33.8665445, lng: 151.1989808 } },
  { key: "aquarium", location: { lat: -33.869627, lng: 151.202146 } },
  { key: "darlingHarbour", location: { lat: -33.87488, lng: 151.1987113 } },
  { key: "barangaroo", location: { lat: -33.8605523, lng: 151.1972205 } },
  { key: "barangaroo", location: { lat: -33.8605523, lng: 151.1972205 } },
];

export default function MapPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const mapId = "b44ced02340309e34f92c893";
  const mapCenter =
    locations.length > 0
      ? locations[0].location
      : { lat: -2.9833, lng: 104.7644 };

  return (
    <>
      <div className="w-full h-screen">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultZoom={13}
            defaultCenter={{ lat: -2.9833, lng: 104.7644 }}
            mapId={mapId}
            onCameraChanged={(ev: MapCameraChangedEvent) => {
              console.log("Camera changed:", ev.detail.center, ev.detail.zoom);
            }}
          >
            <PoiMarkers pois={locations} />
          </Map>
        </APIProvider>
      </div>
    </>
  );
}

// pins
const PoiMarkers = (props: { pois: Poi[] }) => {
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
          position={poi.location}
          ref={(marker) => setMarkerRef(marker, poi.key)}
          onClick={handleClick}
          clickable={true}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="bg-background p-2 rounded-full border">
              <UtensilsCrossed className="size-4" />
            </div>
            <p className="bg-background px-1 rounded-lg">
              {poi.location}
            </p>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
};
