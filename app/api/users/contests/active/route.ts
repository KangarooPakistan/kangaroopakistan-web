import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { db } from "@/app/lib/prisma";

interface ContestData {
  name: string;
  startDate: Date;
  endDate: Date;
  contestDate: string | null;
  resultDate: string | null;
  contestTypeId: string;
}
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const url = new URL(req.url);
    const contestTypeId = url.searchParams.get("contestTypeId");
    
    // Optionally, you can validate if contestTypeId is provided
    if (!contestTypeId) {
      return NextResponse.json({ error: "Missing contestTypeId" }, { status: 401 });
    }

    // Get the current date
    const currentDate = new Date();

    // Query the database to get contests with the specified contestTypeId
    const contests = await db.contest.findMany({
      where: { 
        contestTypeId: contestTypeId,
        endDate: {
          gte: currentDate, // Filter for contests where endDate is greater than or equal to the current date
        },
      },
    });

    return NextResponse.json(contests);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

