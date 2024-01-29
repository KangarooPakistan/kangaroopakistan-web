import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function POST(request: Request) {    
        try {
        const reqBody = await request.json();
        const { registrationId, imageUrl, } = reqBody;
        const paymentProof = await db.paymentProof.create({
            data: {
              imageUrl: imageUrl,
              registrationId: registrationId
            }
          });
      
          console.log('Payment Proof created:', paymentProof);
          return NextResponse.json(paymentProof,  { status: 200 });
      
        } catch (error: any) {
        // Handle errors and return an appropriate response
        return NextResponse.json({ error: error.message }, { status: 500 });
        }

    }