import { db } from "@/app/lib/prisma";
import { Prisma, Level } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

// Helper function to determine award based on percentage and award definitions
function calculateAward(percentage: Decimal, awardDefinition: any) {
  const percentageNumber = Number(percentage);

  if (percentageNumber >= Number(awardDefinition.goldPercent)) {
    return "GOLD";
  } else if (
    percentageNumber >= Number(awardDefinition.silverPercent) &&
    percentageNumber < Number(awardDefinition.goldPercent)
  ) {
    return "SILVER";
  } else if (
    percentageNumber >= Number(awardDefinition.bronzePercent) &&
    percentageNumber < Number(awardDefinition.silverPercent)
  ) {
    return "BRONZE";
  } else if (
    percentageNumber >= Number(awardDefinition.threeStarPercent) &&
    percentageNumber < Number(awardDefinition.bronzePercent)
  ) {
    return "THREE STAR";
  } else if (
    percentageNumber >= Number(awardDefinition.twoStarPercent) &&
    percentageNumber < Number(awardDefinition.threeStarPercent)
  ) {
    return "TWO STAR";
  } else if (
    percentageNumber >= Number(awardDefinition.oneStarPercent) &&
    percentageNumber < Number(awardDefinition.twoStarPercent)
  ) {
    return "ONE STAR";
  } else {
    return "PARTICIPATION";
  }
}

export async function POST(request: Request) {
  try {
    const { contestId } = await request.json();

    // 1. Delete existing results for this contest
    await db.result.deleteMany({
      where: {
        contestId,
      },
    });

    // 2. Get all scores for this contest
    const scores = await db.score.findMany({
      where: {
        contestId,
      },
    });

    // 3. Get award definitions for this contest
    const awardDefinitions = await db.awardDefinition.findMany({
      where: {
        contestId,
      },
    });

    if (awardDefinitions.length === 0) {
      return NextResponse.json(
        { message: "No award definitions found for this contest" },
        { status: 400 }
      );
    }

    // Create a map of award definitions by level for easier access
    const awardDefinitionsByLevel = awardDefinitions.reduce((acc, def) => {
      acc[def.level] = def;
      return acc;
    }, {} as Record<Level, (typeof awardDefinitions)[0]>);

    // 4. Process each score and create results
    const resultsData: Prisma.ResultCreateManyInput[] = scores
      .map((score): Prisma.ResultCreateManyInput | null => {
        const [year, district, schoolId, classStr] = (score.rollNo || "").split(
          "-"
        );
        const classNum = parseInt(classStr, 10);
        const schoolNum = parseInt(schoolId, 10);

        if (!district || isNaN(classNum) || isNaN(schoolNum)) {
          console.error(`Invalid roll number format: ${score.rollNo}`);
          return null;
        }

        const level = classNum >= 1 && classNum <= 4 ? "JUNIOR" : "SENIOR";
        const percentage = new Prisma.Decimal(score.percentage || 0);

        // Get appropriate award definition for this level
        const awardDefinition = awardDefinitionsByLevel[level];
        if (!awardDefinition) {
          console.error(`No award definition found for level: ${level}`);
          return null;
        }

        // Calculate award based on percentage and award definition
        const award = calculateAward(percentage, awardDefinition);

        return {
          id: crypto.randomUUID(), // Generate a new UUID for each result
          scoreId: score.id,
          contestId: score.contestId,
          district,
          schoolId: schoolNum,
          class: classNum,
          level,
          rollNumber: score.rollNo,
          percentage,
          AwardLevel: award,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
      .filter(
        (result): result is Prisma.ResultCreateManyInput => result !== null
      );

    // 5. Create all results in a single transaction
    const createdResults = await db.result.createMany({
      data: resultsData,
      skipDuplicates: true,
    });

    console.log("Results generated successfully");

    return NextResponse.json(
      {
        message: "Results regenerated successfully",
        count: createdResults.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating results:", error);
    return NextResponse.json(
      { message: "Error generating results", error },
      { status: 500 }
    );
  }
}
