import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const GetImageSchema = z.object({
    maxHeightPx: z.number().int().min(1).optional(),
    maxWidthPx: z.number().int().min(1).optional(),
    name: z.string().min(1, "name must be a non-empty string"),

})

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
    const { getUser } = await getKindeServerSession()

    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = GetImageSchema.safeParse({
        maxHeightPx: request.nextUrl.searchParams.get('maxHeightPx') ? Number(request.nextUrl.searchParams.get('maxHeightPx')) : undefined,
        name: request.nextUrl.searchParams.get('name'),
    });

    if (!searchParams.success) {
        return NextResponse.json({ error: searchParams.error.issues }, { status: 400 });
    }

    try {
        const { name, maxHeightPx, maxWidthPx } = searchParams.data;
        const requestSeachParams = new URLSearchParams({
            key: GOOGLE_MAPS_API_KEY || '',
            ...(maxHeightPx ? { maxHeightPx: maxHeightPx.toString() } : {}),
            ...(maxWidthPx ? { maxWidthPx: maxWidthPx.toString() } : {})
        });
        console.log(`https://places.googleapis.com/v1/${name}/media?${requestSeachParams.toString()}`);
        const response = await fetch(`https://places.googleapis.com/v1/${name}/media?${requestSeachParams.toString()}`, {
            method: 'GET',
        })

        if (!response.ok) {
            console.error("Error response from Google Maps API:", await response.text());
            return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
        }

        return response
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}