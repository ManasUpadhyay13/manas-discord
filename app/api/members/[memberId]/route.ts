import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const profile = await currentProfile()
        const { searchParams } = new URL(req.url)
        const serverId = searchParams.get("serverId")


        if (!profile) {
            return new NextResponse("Unauthorized")
        }

        if (!serverId) {
            return new NextResponse("Server id is missing")
        }

        if (!params.memberId) {
            return new NextResponse("Member ID missing")
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: 'asc'
                    }
                }
            }
        })


        return NextResponse.json(server)

    } catch (error) {
        return new NextResponse("Internal Server Error")
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const profile = await currentProfile()

        const { searchParams } = new URL(req.url)
        const { role } = await req.json()

        const serverId = searchParams.get("serverId")

        if (!profile) {
            return new NextResponse("Unauthorized")
        }

        if (!serverId) {
            return new NextResponse("Server id is missing")
        }

        if (!params.memberId) {
            return new NextResponse("Member ID missing")
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: params.memberId,
                            profileId: {
                                not: profile.id
                            }
                        },
                        data: {
                            role
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log(error)
        return new NextResponse("Internal Server Error")
    }
}