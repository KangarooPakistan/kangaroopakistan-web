import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } } ){
    try {
      const registrations = await db.registration.findMany({
        where: {
          contestId: params.id
        },
        include: {
          students: true,
          paymentProof: true,
          user:true // Include related students
      },
      });

      return NextResponse.json(registrations, { status: 200 });

    } catch (error:any) {
      return NextResponse.json({ error: error.message }, { status: 500 });

    }
  } 

