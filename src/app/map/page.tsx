"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import type { Spot } from "@/types/spot";
import SpotMarkers from "./markers";

const locations: Spot[] = [
  { 
    id: "1",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.976, longitude: 104.775 }, 
    types: ["restaurant"], 
    formattedAddress: "Palembang, Indonesia", 
    displayName: { text: "Palembang", languageCode: "en" }
   },
   {
    id: "2",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.983, longitude: 104.783 },
    types: ["cafe"],
    formattedAddress: "Cafe Example, Palembang, Indonesia",
    displayName: { text: "Cafe Example", languageCode: "en" }
   },
   {
    id: "3",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.970, longitude: 104.770 },
    types: ["museum"],
    formattedAddress: "Museum Example, Palembang, Indonesia",
    displayName: { text: "Museum Example", languageCode: "en" }
   },
   {
    id: "4",
    rating: 4.5,
    photos: [],
    googleMapsUri: "https://maps.app.goo.gl/1234567890",
    location: { latitude: -2.980, longitude: 104.760 },
    types: ["park"],
    formattedAddress: "Park Example, Palembang, Indonesia",
    displayName: { text: "Park Example", languageCode: "en" }
   }
]

export default function Page() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = "b44ced02340309e34f92c893";
  if (!apiKey) {
    throw new Error("Missing Api key");
  }
  const mapCenter = { lat: -2.976, lng: 104.775 }; // Palembang, Indonesia

  return (
    <>
      <div className="max-w-4xl mx-auto h-screen">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultZoom={13}
            defaultCenter={mapCenter}
            mapId={"b44ced02340309e34f92c893"}
          >
            <SpotMarkers pois={locations} />
          </Map>
        </APIProvider>
      </div>
    </>
  );
}

