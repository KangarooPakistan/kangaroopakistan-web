import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function GET(request: NextRequest, 
    ) {
    try {   
        const users = await db.user.findMany({
            where: {
               role : "user"
            },
        });

        if (!users) {
            return NextResponse.json({ error: "users not found" }, { status: 404 });
        }
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}