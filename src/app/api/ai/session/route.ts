import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SessionService } from "@/ai/services/server/SessionService";
import { NextResponse } from "next/server";

const sessionService = new SessionService();

export async function GET() {
    try {
        const { getUser } = await getKindeServerSession()
        const user = await getUser()

        if (!user) {
            return NextResponse.json({
                error: 'Unauthorized'
            }, { status: 401 })
        }

        const sessions = await sessionService.getUserSession(user.id)

        return NextResponse.json({
            sessions
        })
    } catch (error) {
        console.error('[GetSessions] Error fetching sessions:', error)
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 })
    }
}