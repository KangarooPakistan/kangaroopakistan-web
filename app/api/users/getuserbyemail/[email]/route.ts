import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    // Fetch all rows from the contestType table
    const user = await db.user.findUnique({
      where: {
        email: params.email,
      },
    });
    // Return the contestTypes as JSON response
    return NextResponse.json(user);
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
