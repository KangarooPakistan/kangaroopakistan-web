import { db } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper function to safely serialize BigInt values
function serializeData(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contestId = params.id;
    console.log("-----------------");

    if (!contestId) {
      return NextResponse.json(
        { message: "Contest ID is required" },
        { status: 400 }
      );
    }

    // Get award definitions for this contest
    // Use Prisma's SQL template literal with proper syntax
    const query = Prisma.sql`
      SELECT AwardLevel, COUNT(*) as count
      FROM results
      WHERE contestId = ${contestId}
      AND AwardLevel IS NOT NULL
      GROUP BY AwardLevel
    `;
    const results = await db.$queryRaw(query);

    const formattedCounts = (results as any[]).reduce((acc, curr) => {
      acc[curr.AwardLevel] = Number(curr.count);
      return acc;
    }, {} as Record<string, number>);

    const response = {
      awardCounts: formattedCounts,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Error fetching results" },
      { status: 500 }
    );
  }
}
