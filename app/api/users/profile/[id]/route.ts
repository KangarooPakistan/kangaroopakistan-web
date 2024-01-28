import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function GET(request: Request, 
    { params }: { params: { id: string } }
    ) {
    try {
        const userId = params.id; // Use parseInt with base 10
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });


        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Optional: Exclude sensitive information like hashed password
        const { password, ...userData } = user;

        return NextResponse.json(userData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
