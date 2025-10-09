import { SessionService } from "@/services/server/SessionService";
import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const sessionService = new SessionService();

export async function GET(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { getUser } = await getKindeServerSession()
        const user = await getUser();

        if (!user) {
            return NextResponse.json({
                error: "Unauthorized"
            }, {
                status: 401
            })
        }

        const { sessionId } = await params

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

        return NextResponse.json({
            data: {
                session
            }
        });
    } catch (e) {
        console.error("[GetSessionById] Error Occured: ", e);
        return NextResponse.json({
            error: "Internal Server Error"
        }, {
            status: 500
        })
    }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { getUser } = await getKindeServerSession()
        const user = await getUser();

        if (!user) {
            return NextResponse.json({
                error: "Unauthorized"
            }, {
                status: 401
            })
        }

        const { sessionId } = await params

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

        await sessionService.deleteSession(sessionId);

        return NextResponse.json({
            data: {
                success: true,
                session
            }
        });
    } catch (e) {
        console.error("[GetSessionById] Error Occured: ", e);
        return NextResponse.json({
            error: "Internal Server Error"
        }, {
            status: 500
        })
    }
}