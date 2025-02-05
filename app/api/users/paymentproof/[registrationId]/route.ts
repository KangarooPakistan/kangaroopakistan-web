import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { registrationId: string } }
) {
  try {
    if (!params.registrationId) {
      return NextResponse.json(
        { message: "Missing registrationId in query parameters" },
        { status: 400 }
      );
    }
    const paymentProof = await db.paymentProof.findMany({
      where: {
        registrationId: params.registrationId,
      },
    });

    if (!paymentProof) {
      return NextResponse.json(
        { message: "Payment proof not found" },
        { status: 404 }
      );
    }
    if (!params.registrationId) {
      return NextResponse.json(
        { message: "Missing registrationId in query parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json(paymentProof, { status: 200 });
  } catch (error) {
    return NextResponse.json(params.registrationId, { status: 400 });
  }
}
