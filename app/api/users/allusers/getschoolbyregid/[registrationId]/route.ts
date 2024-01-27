import { NextResponse, NextRequest } from "next/server";

import { db } from "@/app/lib/prisma";
export async function GET(request: NextRequest,
    { params }: { params: { registrationId: string } }
    ) {
        try {
        const registration = await db.registration.findUnique({
            where: {
                id: params.registrationId,
            },
            include: {
                user: true, // Include the related User record
            },
        });
        console.log(registration)
    } 

        catch (error) {
            console.log('error')
        }

}