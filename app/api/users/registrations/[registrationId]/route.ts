import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, 
    { params }: { params: { registrationId: string } }){
        console.log(params.registrationId)
        try {
            const registrations = await db.registration.findMany({
                where: {
                    id:params.registrationId
                },
                include: {
                    students: true, // Include related students
                    paymentProof: true, // Include related payment proofs
                    user: true, // Include the related user
                    // Add other related fields if necessary
                },
            });
          
              return NextResponse.json(registrations, { status: 200 });
        } catch (error) {
            return NextResponse.json(params.registrationId,  { status: 400 });
            
        }

}