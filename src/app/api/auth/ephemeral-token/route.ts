import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { EphmeralTokenService } from "@/ai/services/server/EphmeralTokenService";
import { NextResponse } from "next/server";

const tokenService = new EphmeralTokenService();

export async function POST(request: Request) {
    try {
        const { getUser } = await getKindeServerSession()
        const user = await getUser()

        if (!user) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 })
        }

        // Parse request body for custom duration (optional)
        let duration = 3600; // Default 1 hour
        try {
            const body = await request.json();
            if (body.duration && typeof body.duration === 'number' && body.duration > 0) {
                duration = Math.min(body.duration, 86400); // Max 24 hours
            }
        } catch {
            // Use default duration if body parsing fails
        }

        const token = await tokenService.generateToken(
            user.given_name || user.email || 'unknown',
            user.id,
            duration
        );

        return NextResponse.json({
            token,
            expiresIn: duration,
            expiresAt: new Date(Date.now() + duration * 1000).toISOString()
        });

    } catch (error) {
        console.error('[EphemeralToken] Error generating token:', error);
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function GET() {
    // GET method for simple token generation with default duration
    try {
        const { getUser } = await getKindeServerSession()
        const user = await getUser()

        if (!user) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 })
        }

        const duration = 3600; // 1 hour default
        const token = await tokenService.generateToken(
            user.given_name || user.email || 'unknown',
            user.id,
            duration
        );

        return NextResponse.json({
            token,
            expiresIn: duration,
            expiresAt: new Date(Date.now() + duration * 1000).toISOString()
        });

    } catch (error) {
        console.error('[EphemeralToken] Error generating token:', error);
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}