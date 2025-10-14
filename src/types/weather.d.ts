export interface WeatherResponse {
  currentTime: string
  timeZone: TimeZone
  isDaytime: boolean
  weatherCondition: WeatherCondition
  temperature: Temperature
  feelsLikeTemperature: FeelsLikeTemperature
  dewPoint: DewPoint
  heatIndex: HeatIndex
  windChill: WindChill
  relativeHumidity: number
  uvIndex: number
  precipitation: Precipitation
  thunderstormProbability: number
  airPressure: AirPressure
  wind: Wind
  visibility: Visibility
  cloudCover: number
  currentConditionsHistory: CurrentConditionsHistory
}

export interface TimeZone {
  id: string
}

export interface WeatherCondition {
  iconBaseUri: string
  description: Description
  type: string
}

export interface Description {
  text: string
  languageCode: string
}

export interface Temperature {
  degrees: number
  unit: string
}

export interface FeelsLikeTemperature {
  degrees: number
  unit: string
}

export interface DewPoint {
  degrees: number
  unit: string
}

export interface HeatIndex {
  degrees: number
  unit: string
}

export interface WindChill {
  degrees: number
  unit: string
}

export interface Precipitation {
  probability: Probability
  snowQpf: SnowQpf
  qpf: Qpf
}

export interface Probability {
  percent: number
  type: string
}

export interface SnowQpf {
  quantity: number
  unit: string
}

export interface Qpf {
  quantity: number
  unit: string
}

export interface AirPressure {
  meanSeaLevelMillibars: number
}

export interface Wind {
  direction: Direction
  speed: Speed
  gust: Gust
}

export interface Direction {
  degrees: number
  cardinal: string
}

export interface Speed {
  value: number
  unit: string
}

export interface Gust {
  value: number
  unit: string
}

export interface Visibility {
  distance: number
  unit: string
}

export interface CurrentConditionsHistory {
  temperatureChange: TemperatureChange
  maxTemperature: MaxTemperature
  minTemperature: MinTemperature
  snowQpf: SnowQpf2
  qpf: Qpf2
}

export interface TemperatureChange {
  degrees: number
  unit: string
}

export interface MaxTemperature {
  degrees: number
  unit: string
}

export interface MinTemperature {
  degrees: number
  unit: string
}

export interface SnowQpf2 {
  quantity: number
  unit: string
}

export interface Qpf2 {
  quantity: number
  unit: string
}
