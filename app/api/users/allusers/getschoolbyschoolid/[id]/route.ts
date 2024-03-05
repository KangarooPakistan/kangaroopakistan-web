import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function GET(request: NextRequest, 
    { params }: { params: { id: string } }
    ) {
    try {   
        const schoolId = parseInt(params.id, 10);

        const user = await db.user.findUnique({
            where: {
               schoolId : schoolId
            },
        });

        if (!user) {
            return NextResponse.json({ error: "users not found" }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}