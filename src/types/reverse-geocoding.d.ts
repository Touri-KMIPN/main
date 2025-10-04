export interface ReverseGeocodingResponse {
  address_descriptor: AddressDescriptor
  plus_code: PlusCode
  results: Result[]
  status: string
}

export interface AddressDescriptor {
  areas: Area[]
  landmarks: Landmark[]
  unfiltered_landmarks: any[]
}

export interface Area {
  containment: string
  display_name: DisplayName
  place_id: string
}

export interface DisplayName {
  language_code: string
  text: string
}

export interface Landmark {
  display_name: DisplayName2
  place_id: string
  spatial_relationship: string
  straight_line_distance_meters: number
  travel_distance_meters: number
  types: string[]
}

export interface DisplayName2 {
  language_code: string
  text: string
}

export interface PlusCode {
  compound_code: string
  global_code: string
}

export interface Result {
  address_components: AddressComponent[]
  formatted_address: string
  geometry: Geometry
  place_id: string
  types: string[]
  plus_code?: PlusCode2
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface Geometry {
  location: Location
  location_type: string
  viewport: Viewport
  bounds?: Bounds
}

export interface Location {
  lat: number
  lng: number
}

export interface Viewport {
  northeast: Northeast
  southwest: Southwest
}

export interface Northeast {
  lat: number
  lng: number
}

export interface Southwest {
  lat: number
  lng: number
}

export interface Bounds {
  northeast: Northeast2
  southwest: Southwest2
}

export interface Northeast2 {
  lat: number
  lng: number
}

export interface Southwest2 {
  lat: number
  lng: number
}

export interface PlusCode2 {
  compound_code: string
  global_code: string
}
