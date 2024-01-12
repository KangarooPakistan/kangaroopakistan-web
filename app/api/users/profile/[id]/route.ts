import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

console.log('kainat')
export async function GET(request: Request, 
    { params }: { params: { id: string } }
    ) {
    try {
        const userId = parseInt(params.id, 10); // Use parseInt with base 10
        console.log("Use parseInt with base 10")
        console.log(isNaN(userId))

        if (isNaN(userId)) {
            return NextResponse.json({ error: "User ID is required and must be a number" }, { status: 400 });
        }

        console.log("params.id", userId);
        
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
