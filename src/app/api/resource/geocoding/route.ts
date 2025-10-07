import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const ReverseGeocodeSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
})

export async function GET(request: NextRequest) {
    const { getUser } = await getKindeServerSession()

    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { latitude, longitude } = ReverseGeocodeSchema.parse({
        latitude: parseInt(request.nextUrl.searchParams.get('lat') ?? ""),
        longitude: parseInt(request.nextUrl.searchParams.get('long') ?? "")
    });

    try {
        const REQUEST_URI = "https://maps.googleapis.com/maps/api/geocode/json"
        const searchParams = new URLSearchParams({
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_MAPS_API_KEY || '',
            extra_computations: "ADDRESS_DESCRIPTORS"
        });

        console.log("Fetching reverse geocode with params:", searchParams.toString());

        const response = await fetch(REQUEST_URI + "?" + searchParams.toString(), {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}