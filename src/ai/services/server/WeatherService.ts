import { WeatherResponse } from "@/types/weather";

export class WeatherService {
    readonly REQUEST_URL = "https://weather.googleapis.com/v1/currentConditions:lookup";
    readonly API_KEY = process.env.GOOGLE_WEATHER_API_KEY;
    
    async getWeather({ lat, lng }: { lat: string, lng: string }): Promise<WeatherResponse> {
        const searchParams = new URLSearchParams({
            key: this.API_KEY || "",
            'location.latitude': lat,
            'location.longitude': lng,
        });

        const response = await fetch(`${this.REQUEST_URL}?${searchParams.toString()}`);
        if (!response.ok) {
            throw new Error(`Error fetching weather data: ${response.statusText}`);
        }
        const data = await response.json();
        return data as WeatherResponse;
    }
}