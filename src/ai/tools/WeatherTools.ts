import { ChatCallableFunction } from "@/types/tool";
import { WeatherService } from "../services/server/WeatherService";
import z from "zod";

export const GetWeatherConditionTool: ChatCallableFunction = {
    name: "get_weather_condition",
    description: "Get the current weather condition based on latitude and longitude.",
    schema: z.object({
        latitude: z.number().min(-90).max(90).optional().describe("The latitude of the location."),
        longitude: z.number().min(-180).max(180).optional().describe("The longitude of the location."),
    }),
    async execute(args, context) {
        if (!args) {
            throw new Error('Invalid arguments');
        }

        const validated = this.validate?.(args);
        if (!validated.success) {
            throw new Error(`Invalid arguments: ${validated.error.message}`);
        }
        const { latitude, longitude } = validated.data;

        if (!args.latitude || !args.longitude) {
            if (!context.geoLocation?.lat || !context.geoLocation?.lng) {
                throw new Error('Latitude and Longitude are required either as arguments or in context.');
            }
        }

        const finalLat = latitude || parseFloat(context.geoLocation?.lat || "0");
        const finalLng = longitude || parseFloat(context.geoLocation?.lng || "0");

        console.log("GetWeatherConditionTool called with:", { finalLat, finalLng });

        const weatherService = new WeatherService();
        const weather = await weatherService.getWeather({ lat: finalLat, lng: finalLng });

        // Skip Typesafety For Tooling Reasons
        return weather as unknown as Record<string, unknown>;
    },
    validate(args) {
        return this.schema?.safeParse(args);
    },
}