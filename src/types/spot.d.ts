export interface Spot {
  types: string[]
  formattedAddress: string
  location: Location
  displayName: DisplayName
  photos?: Photo[]
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
