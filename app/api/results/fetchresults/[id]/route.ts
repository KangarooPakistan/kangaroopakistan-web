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
    const awardDefinition = await db.awardDefinition.findFirst({
      where: {
        contestId,
      },
    });

    if (!awardDefinition) {
      return NextResponse.json(
        { message: "Award definition not found" },
        { status: 404 }
      );
    }

    // Get results with their scores
    const results = await db.result.findMany({
      where: {
        contestId,
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

    // Categorize results by award
    const categorizedResults = results.map((result) => {
      let award = "Participation";
      const percentage = Number(result.percentage);

      if (percentage >= Number(awardDefinition.goldPercent)) {
        award = "Gold";
      } else if (percentage >= Number(awardDefinition.silverPercent)) {
        award = "Silver";
      } else if (percentage >= Number(awardDefinition.bronzePercent)) {
        award = "Bronze";
      } else if (percentage >= Number(awardDefinition.threeStarPercent)) {
        award = "Three Star";
      } else if (percentage >= Number(awardDefinition.twoStarPercent)) {
        award = "Two Star";
      } else if (percentage >= Number(awardDefinition.oneStarPercent)) {
        award = "One Star";
      }

      return {
        ...result,
        award,
      };
    });

    // Serialize the data to handle BigInt values
    const serializedResults = serializeData(categorizedResults);

    return NextResponse.json(serializedResults, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Error fetching results" },
      { status: 500 }
    );
  }
}
