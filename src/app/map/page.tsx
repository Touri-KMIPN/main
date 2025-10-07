"use client";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import SpotMarkers from "./_components/markers";
import { useGeolocation } from "@/hooks/use-geolocation";
import UserLocationMarker from "@/app/map/_components/user-location-marker";
import { useSpots } from "@/providers/SpotsProvider";

export default function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
  const { spots } = useSpots();
  const mapId = "b44ced02340309e34f92c893";
  if (!apiKey) {
    throw new Error("Missing Api key");
  }
  const { latitude, longitude, loading, error } = useGeolocation();

  // Use user location if available, otherwise fallback to default
  const mapCenter =
    latitude && longitude
      ? { lat: latitude, lng: longitude }
      : { lat: -2.976, lng: 104.775 }; // Palembang, Indonesia as fallback

  if (loading) {
    return;
  }

  return (
    <>
      <div className="h-full w-full">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultZoom={latitude && longitude ? 15 : 13}
            defaultCenter={mapCenter}
            mapId={mapId}
            mapTypeControl={false}
            streetViewControl={true}
            cameraControl={false}
            fullscreenControl={true}
          >
            <SpotMarkers pois={spots} />
            {/* show user location */}
            {latitude && longitude && (
              <UserLocationMarker latitude={latitude} longitude={longitude} />
            )}
          </Map>
        </APIProvider>
      </div>
    </>
  );
}
