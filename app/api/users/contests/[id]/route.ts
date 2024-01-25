import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function GET(request: Request, 
    { params }: { params: { id: string } }
    ) {
    try {
        
        const contest = await db.contest.findUnique({
            where: {
                id: params.id,
            },
        });


        if (!contest) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json(contest);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
