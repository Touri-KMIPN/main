export interface Spot {
  id: string
  types: string[]
  formattedAddress: string
  location: Location
  rating: number
  displayName: DisplayName
  photos: Photo[],
  googleMapsUri: string
}

export interface Location {
  latitude: number
  longitude: number
}

export interface DisplayName {
  text: string
  languageCode: string
}

export interface Photo {
  name: string
  widthPx: number
  heightPx: number
  authorAttributions: AuthorAttribution[]
  flagContentUri: string
  googleMapsUri: string
}

export interface AuthorAttribution {
  displayName: string
  uri: string
  photoUri: string
}
