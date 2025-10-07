import {SessionService} from "@/services/server/SessionService";
import {NextRequest, NextResponse} from "next/server";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";

const sessionService = new SessionService();

export async function GET(_: NextRequest, {params}: { params: Promise<{ sessionId: string }> }) {
    try {
        const {getUser} = await getKindeServerSession()
        const user = await getUser();

        if (!user) {
            return NextResponse.json({
                error: "Unauthorized"
            }, {
                status: 500
            })
        }

        const {sessionId} = await params

        const session = await sessionService.getSessionById(sessionId);

        if (!session) {
            return NextResponse.json({
                error: "Session not found"
            }, {
                status: 404
            })
        }

        if (session.userId !== user.id) {
            return NextResponse.json({
                error: "Session not found"
            }, {
                status: 404
            })
        }

        const messages = await sessionService.getSessionMessages(session.id);

        return NextResponse.json({
            messages
        })
    } catch (e) {
        console.error("[GetSessionMessages] Error Occured: ", e);
        return NextResponse.json({
            error: "Internal Server Error"
        }, {
            status: 500
        })
    }
}