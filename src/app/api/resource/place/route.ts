import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod/v4";

const SearchPlaceSchema = z.object({
    maxResultCount: z.number().int().min(1, "maxResultCount must be a positive integer"),
    radius: z.number().int().min(1, "radius must be a positive integer"),
    long: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
    textQuery: z.string().min(1, "textQuery must be a non-empty string"),
})

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_ENDPOINT = "https://places.googleapis.com/v1";

export async function GET(request: NextRequest) {

    const { getUser } = await getKindeServerSession()

    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = SearchPlaceSchema.safeParse({
        maxResultCount: Number(request.nextUrl.searchParams.get('maxResultCount')),
        radius: Number(request.nextUrl.searchParams.get('radius')),
        long: Number(request.nextUrl.searchParams.get('long')),
        lat: Number(request.nextUrl.searchParams.get('lat')),
        textQuery: request.nextUrl.searchParams.get('textQuery'),
    });

    if (!searchParams.success) {
        return NextResponse.json({ error: searchParams.error.issues }, { status: 400 });
    }

    try {

        const { lat, long, maxResultCount, radius, textQuery } = searchParams.data;

        const response = await fetch(`${GOOGLE_MAPS_API_ENDPOINT}/places:searchText?key=${GOOGLE_MAPS_API_KEY}`, {
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
                            latitude: lat || 0,
                            longitude: long || 0
                        },
                        radius
                    }
                }
            })
        });

        if (!response.ok) {
            console.error("Error occurred while fetching places:", await response.json());
            return NextResponse.json({ error: `API request failed with status ${response.status}: ${response.statusText}` }, { status: 500 });
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error occurred while fetching places:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}