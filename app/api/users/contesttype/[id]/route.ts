import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contestType = await db.contestType.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!contestType) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Optional: Exclude sensitive information like hashed password
    // const {  ...contestTypeData } = contestType;

    return NextResponse.json(contestType);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
