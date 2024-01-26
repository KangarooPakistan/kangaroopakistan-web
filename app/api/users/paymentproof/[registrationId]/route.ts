import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, 
    { params }: { params: { registrationId: string } }){
        console.log(params.registrationId)
        try {
            if (!params.registrationId) {
                return NextResponse.json({ error: "Missing registrationId in query parameters" }, { status: 400 });
              }
              const paymentProof = await db.paymentProof.findFirst({
                where: {
                  registrationId: params.registrationId
                }
              });
          
              if (!paymentProof) {
                return NextResponse.json({ error: "Payment proof not found" }, { status: 404 });
              }
          
              return NextResponse.json(paymentProof, { status: 200 });
        } catch (error) {
            return NextResponse.json(params.registrationId,  { status: 400 });
            
        }

    }