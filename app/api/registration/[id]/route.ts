import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const registrations = await db.registration.findFirst({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(registrations, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error while fetching pdf data" },
      { status: 400 }
    );
  }
}
