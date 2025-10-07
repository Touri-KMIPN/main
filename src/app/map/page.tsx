"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import type { Spot, PlaceType } from "@/types/spot";
import SpotMarkers from "./_components/markers";
import { useGeolocation } from "@/hooks/use-geolocation";
import UserLocationMarker from "@/app/map/_components/user-location-marker";

const locations: Spot[] = [
  { 
    id: "1",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.976, longitude: 104.775 }, 
    types: ["restaurant"] as PlaceType[], 
    formattedAddress: "Palembang, Indonesia", 
    displayName: { text: "Local Restaurant", languageCode: "en" }
   },
   {
    id: "2",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.983, longitude: 104.783 },
    types: ["cafe"] as PlaceType[],
    formattedAddress: "Cafe Example, Palembang, Indonesia",
    displayName: { text: "Coffee Shop", languageCode: "en" }
   },
   {
    id: "3",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.970, longitude: 104.770 },
    types: ["museum"] as PlaceType[],
    formattedAddress: "Museum Example, Palembang, Indonesia",
    displayName: { text: "History Museum", languageCode: "en" }
   },
   {
    id: "4",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.980, longitude: 104.760 },
    types: ["park"] as PlaceType[],
    formattedAddress: "Park Example, Palembang, Indonesia",
    displayName: { text: "City Park", languageCode: "en" }
   },
   {
    id: "5",
    rating: 4.2,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.985, longitude: 104.780 },
    types: ["hospital"] as PlaceType[],
    formattedAddress: "Hospital Example, Palembang, Indonesia",
    displayName: { text: "General Hospital", languageCode: "en" }
   },
   {
    id: "6",
    rating: 4.8,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.975, longitude: 104.785 },
    types: ["shopping_mall"] as PlaceType[],
    formattedAddress: "Mall Example, Palembang, Indonesia",
    displayName: { text: "Shopping Center", languageCode: "en" }
   }
]

export default function MapPage() {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY
  const mapId = "b44ced02340309e34f92c893"
  if (!apiKey) {
    throw new Error("Missing Api key")
  }
  const { latitude, longitude, loading, error } = useGeolocation()
  
  // Use user location if available, otherwise fallback to default
  const mapCenter = latitude && longitude 
    ? { lat: latitude, lng: longitude } 
    : { lat: -2.976, lng: 104.775 } // Palembang, Indonesia as fallback

  if (loading) {
    return
  }

  return (
    <>
      <div className="max-w-4xl mx-auto h-screen relative">
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
            <SpotMarkers pois={locations} />
            {/* show user location */}
            {latitude && longitude && (
              <UserLocationMarker 
                latitude={latitude} 
                longitude={longitude} 
              />
            )}
          </Map>
        </APIProvider>
      </div>
    </>
  );
}

