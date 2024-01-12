import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

console.log('kainat')
export async function GET(request: NextRequest) {
    console.log('kainat')
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id'); // Assuming the ID is passed as a query parameter

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: {
                id: parseInt(id),
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
