import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client"
import { NextResponse } from "next/server"

export async function POST(
    req: Request
) {
    try {
        const profile = await currentProfile()
        const { name, type } = await req.json()

        const { searchParams } = new URL(req.url)

        const serverId = searchParams.get('serverId')

        if (!profile) {
            return new NextResponse("Unauthorized")
        }

        if (!serverId) {
            return new NextResponse("Server Id missing")
        }

        if (name === "general") {
            return new NextResponse("Name cannot be general")
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            data: {
                channels: {
                    create: {
                        profileId: profile.id,
                        name,
                        type,
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error: any) {
        console.log(error.message)
        return new NextResponse("Internal Server Error")
    }
}