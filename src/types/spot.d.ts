// Place type union for better type safety
export type PlaceType =
  // Establishments
  | "restaurant"
  | "cafe"
  | "bar"
  | "hospital"
  | "school"
  | "bank"
  | "gas_station"
  | "pharmacy"
  | "post_office"
  | "police"
  | "fire_station"
  | "library"
  // Tourist attractions
  | "tourist_attraction"
  | "museum"
  | "zoo"
  | "amusement_park"
  | "aquarium"
  | "art_gallery"
  | "church"
  | "mosque"
  | "temple"
  | "synagogue"
  // Geographic
  | "park"
  | "airport"
  | "train_station"
  | "bus_station"
  | "subway_station"
  | "shopping_mall"
  | "store"
  | "supermarket"
  | "clothing_store"
  // Administrative
  | "locality"
  | "administrative_area_level_1"
  | "country"
  | "neighborhood"
  // Points of interest
  | "point_of_interest"
  | "establishment"
  | "landmark";

export interface Spot {
  id: string;
  types: PlaceType[];
  formattedAddress: string;
  location: Location;
  rating: number;
  displayName: DisplayName;
  photos: Photo[];
  googleMapsUri: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DisplayName {
  text: string;
  languageCode: string;
}

export interface Photo {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: AuthorAttribution[];
  flagContentUri: string;
  googleMapsUri: string;
}

export interface AuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}
