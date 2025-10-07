import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

// Force dynamic behavior and disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      where: {
        role: "user",
      },
    });

    if (!users) {
      return NextResponse.json({ message: "users not found" }, { status: 404 });
    }

    // Add cache control headers to prevent caching
    const response = NextResponse.json(users);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: "There was an error while fetching data" },
      { status: 500 }
    );
  }
}
