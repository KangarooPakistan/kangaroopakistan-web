import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } } ){
    try {
      console.log('-----------------------------------------')
      const registrations = await db.registration.findMany({
        where: {
          contestId: params.id
        },
        include: {
          students: true,
        
      },
      });
      console.log(registrations)

      return NextResponse.json(registrations, { status: 200 });

    } catch (error:any) {
      return NextResponse.json({ error: error.message }, { status: 500 });

    }
  } 

