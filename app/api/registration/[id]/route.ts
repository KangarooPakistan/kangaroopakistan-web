import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, 
    { params }: { params: { id: string } }){
        try {
            const registrations = await db.registration.findFirst({
                where: {
                    id:params.id
                },
            });
          
              return NextResponse.json(registrations, { status: 200 });
        } catch (error) {
            return NextResponse.json(params.id,  { status: 400 });
            
        }
}