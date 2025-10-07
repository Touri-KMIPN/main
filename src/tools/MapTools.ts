import { CallableTool_2 } from "@/types/tool";
import z from "zod";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export const SearchPlaceTools: CallableTool_2 = {
    name: "search_place",
    description: "Search for places based on a query and location.",
    schema: z.object({
        maxResultCount: z.number().int().min(1, "maxResultCount must be a positive integer").describe("The maximum number of results to return."),
        radius: z.number().int().min(1, "radius must be a positive integer").describe("The radius (in meters) within which to search for places."),
        locationCenter: z.object({
            latitude: z.number().min(-90).max(90).describe("The latitude of the center point."),
            longitude: z.number().min(-180).max(180).describe("The longitude of the center point.")
        }).optional().describe("The center point (latitude and longitude) around which to search for places."),
        textQuery: z.string().min(1, "textQuery must be a non-empty string").describe("The text query to search for places."),
    }),
    async execute(args, context) {
        if (!args) {
            throw new Error('Invalid arguments');
        }

        const validated = this.validate?.(args);
        if (!validated.success) {
            throw new Error(`Invalid arguments: ${validated.error.message}`);
        }

        let { maxResultCount, radius, locationCenter, textQuery } = validated.data;

        if (!radius) {
            if (context.geoLocation) {
                locationCenter = {
                    latitude: parseFloat(context.geoLocation.lat ?? "0"),
                    longitude: parseFloat(context.geoLocation.lng ?? "0")
                }
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }
            );

            locationCenter = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
        }
        const response = await fetch(`https://places.googleapis.com/v1/places:searchText?key=${GOOGLE_MAPS_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY || '',
                'X-Goog-FieldMask': 'places.displayName,places.location,places.photos,places.formattedAddress,places.types,places.id,places.rating,places.googleMapsUri'
            },


            body: JSON.stringify({
                textQuery,
                maxResultCount,
                locationBias: {
                    circle: {
                        center: {
                            latitude: locationCenter?.latitude || 0,
                            longitude: locationCenter?.longitude || 0
                        },
                        radius
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.places || !Array.isArray(data.places)) {
            throw new Error('Invalid API response: missing places array');
        }

        return {
            spots: data.places
        }
    },
    async liveExecute(args) {
        if (!args) {
            throw new Error('Invalid arguments');
        }

        const validated = this.validate?.(args);
        if (!validated.success) {
            throw new Error(`Invalid arguments: ${validated.error.message}`);
        }

        let { maxResultCount, radius, locationCenter, textQuery } = validated.data;

        if (!radius) {
            if (!navigator.geolocation) {
                throw new Error("Geolocation is not supported by user's browser make sure the user enable and allowed location.");
            }
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }
            );

            locationCenter = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }
        }

        try {
            const searchParams = new URLSearchParams({
                maxResultCount: maxResultCount.toString(),
                radius: radius.toString(),
                latitude: locationCenter?.latitude.toString() || '0',
                longitude: locationCenter?.longitude.toString() || '0',
                textQuery
            });

            const response = await fetch(`/api/resource/place?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.locations || !Array.isArray(data.locations)) {
                throw new Error('Invalid API response: missing locations array');
            }

            return {
                spots: data.locations
            }
        } catch (error) {
            console.error('Error occurred while fetching places:', error);
            throw new Error('Failed to fetch places');
        }
    },
    validate(args) {
        return this.schema?.safeParse(args);
    },
}

export const GetUserLocationTool: CallableTool_2 = {
    name: "get_user_location",
    description: "Get the user's current geographical location (latitude and longitude).",
    async execute(_, context) {
        return {
            latitude: parseFloat(context.geoLocation?.lat || "0"),
            longitude: parseFloat(context.geoLocation?.lng || "0")
        }
    },
    async liveExecute(_) {
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by user's browser make sure the user enable and allowed location.");
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }

        );
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
    }
}

export const ReverseGeocodingTool: CallableTool_2 = {
    name: "reverse_geocode_tool",
    description: `
    Get the closest location based on latitude and longitude.
    this can be used to give user location based on their coordinates.
    `,
    schema: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),
    async execute(args) {
            const validated = this.validate?.(args);
        if (!validated.success) {
            throw new Error(`Invalid arguments: ${validated.error.message}`);
        }

        const { latitude, longitude } = validated.data;

        const REQUEST_URI = "https://maps.googleapis.com/maps/api/geocode/json"
        const searchParams = new URLSearchParams({
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_MAPS_API_KEY || '',
        });


        const response = await fetch(`${REQUEST_URI}?${searchParams.toString()}`, {
            method: 'POST',
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return data
    },
    async liveExecute(args) {
        const validated = this.validate?.(args);
        if (!validated.success) {
            throw new Error(`Invalid arguments: ${validated.error.message}`);
        }

        const { latitude, longitude } = validated.data;

        const REQUEST_URI = "/api/resource/geocoding"
        const searchParams = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        });

        const response = await fetch(`${REQUEST_URI}?${searchParams.toString()}`, {
            method: 'POST',
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return data
    },
    validate(args) {
        return this.schema?.safeParse(args);
    }
}