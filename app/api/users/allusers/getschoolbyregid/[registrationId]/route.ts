import { NextResponse, NextRequest } from "next/server";

import { db } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
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
    return NextResponse.json(registration);
  } catch (error: any) {
    return NextResponse.json(
      { message: "There was an error while fetching data" },
      { status: 500 }
    );
  }
}
