import { db } from "@/app/lib/prisma";
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
  { params }: { params: { id: string; schoolId: string } }
) {
  try {
    const contestId = params.id;
    const schoolIdString = params.schoolId;
    const schoolId = parseInt(schoolIdString);

    console.log("-----------------");

    if (!contestId) {
      return NextResponse.json(
        { message: "Contest ID is required" },
        { status: 400 }
      );
    }

    // Get results with their scores
    const results = await db.result.findMany({
      where: {
        contestId,
        schoolId,
      },
      include: {
        score: {
          select: {
            rollNo: true,
            percentage: true,
          },
        },
      },
      orderBy: {
        percentage: "desc",
      },
    });

    console.log(results);
    const serializedResults = results.map((result) => ({
      ...result,
      scoreId: result.scoreId ? result.scoreId.toString() : null,
      percentage: result.percentage ? Number(result.percentage) : null,
      score: result.score
        ? {
            ...result.score,
            percentage: result.score.percentage
              ? Number(result.score.percentage)
              : null,
          }
        : null,
    }));

    return NextResponse.json(serializedResults, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Error fetching results" },
      { status: 500 }
    );
  }
}
