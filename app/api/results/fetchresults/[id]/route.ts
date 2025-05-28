import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    if (!contestId) {
      return NextResponse.json(
        { message: "Contest ID is required" },
        { status: 400 }
      );
    }

    // Execute all queries in parallel for maximum performance
    const [awardDefinitions, results] = await Promise.all([
      // Get award definitions for all levels
      db.awardDefinition.findMany({
        where: { contestId },
        select: {
          level: true,
          goldPercent: true,
          silverPercent: true,
          bronzePercent: true,
          threeStarPercent: true,
          twoStarPercent: true,
          oneStarPercent: true,
          participationPercent: true,
        },
      }),

      // Single optimized query with JOIN to get school details directly
      db.$queryRaw`
        SELECT 
          r.id,
          r.percentage,
          r.rollNumber,
          r.district,
          r.class,
          r.level,
          r.AwardLevel,
          r.schoolId,
          r.scoreId,
          r.contestId,
          
          -- Contest details
          c.name as contestName,
          c.startDate,
          c.endDate,
          c.contestDate,
          c.resultDate,
          c.contestCh,
          c.contestNo,
          
          -- Score details
          s.ID as scoreDbId,
          s.ROLL_NO as scoreRollNo,
          s.PERCENTAGE as scorePercentage,
          s.SCORE as scoreValue,
          s.TOTAL_MARKS as totalMarks,
          s.C_TOTAL as cTotal,
          s.WRONG as wrong,
          s.MISSING as missing,
          s.CREDIT_SCORE as creditScore,
          
          -- School details (from User table)
          u.schoolName,
          u.city,
          u.district as schoolDistrict,
          
          -- Student details
          st.studentName,
          st.fatherName,
          st.class as studentClass,
          st.level as studentLevel
          
        FROM results r
        LEFT JOIN Contest c ON r.contestId = c.id
        LEFT JOIN u_scores s ON r.scoreId = s.ID
        LEFT JOIN User u ON r.schoolId = u.schoolId
        LEFT JOIN Student st ON r.rollNumber = st.rollNumber
        WHERE r.contestId = ${contestId}
        ORDER BY r.percentage DESC
      `,
    ]);

    if (awardDefinitions.length === 0) {
      return NextResponse.json(
        { message: "Award definitions not found" },
        { status: 404 }
      );
    }

    // Create award threshold maps for each level
    const awardThresholds = awardDefinitions.reduce((acc, def) => {
      acc[def.level] = {
        gold: Number(def.goldPercent),
        silver: Number(def.silverPercent),
        bronze: Number(def.bronzePercent),
        threeStar: Number(def.threeStarPercent),
        twoStar: Number(def.twoStarPercent),
        oneStar: Number(def.oneStarPercent),
        participation: Number(def.participationPercent),
      };
      return acc;
    }, {} as Record<string, any>);

    // Function to determine award based on percentage and level
    const getAward = (percentage: number, level: string): string => {
      const thresholds = awardThresholds[level];
      if (!thresholds) return "Participation";

      if (percentage >= thresholds.gold) return "Gold";
      if (percentage >= thresholds.silver) return "Silver";
      if (percentage >= thresholds.bronze) return "Bronze";
      if (percentage >= thresholds.threeStar) return "Three Star";
      if (percentage >= thresholds.twoStar) return "Two Star";
      if (percentage >= thresholds.oneStar) return "One Star";
      return "Participation";
    };

    // Process and format results
    const formattedResults = (results as any[]).map((result) => {
      const percentage = Number(result.percentage);

      // Determine award if not already set
      const award = result.AwardLevel || getAward(percentage, result.level);

      return {
        id: result.id,
        percentage: percentage,
        rollNumber: result.rollNumber,
        district: result.district,
        class: Number(result.class),
        level: result.level,
        AwardLevel: award,
        schoolId: Number(result.schoolId),
        scoreId: result.scoreDbId?.toString(),

        // School details (from JOIN)
        schoolName: result.schoolName || "Unknown School",

        // Contest details
        contest: {
          id: result.contestId,
          name: result.contestName,
          startDate: result.startDate,
          endDate: result.endDate,
          contestDate: result.contestDate,
          resultDate: result.resultDate,
          contestCh: result.contestCh,
          contestNo: result.contestNo,
        },

        // Score details
        score: {
          id: result.scoreDbId?.toString(),
          rollNo: result.scoreRollNo,
          percentage: result.scorePercentage
            ? Number(result.scorePercentage)
            : null,
          score: result.scoreValue?.toString(),
          totalMarks: result.totalMarks?.toString(),
          cTotal: result.cTotal,
          wrong: result.wrong,
          missing: result.missing,
          creditScore: result.creditScore,
        },

        // Student details
        studentDetails: {
          class: result.studentClass || result.class?.toString() || "",
          city: result.city || "",
          district: result.schoolDistrict || result.district || "",
          fatherName: result.fatherName || "",
          level: result.studentLevel || result.level || "",
          schoolId: Number(result.schoolId),
          schoolName: result.schoolName || "Unknown School",
          studentName: result.studentName || "",
        },
      };
    });

    // Serialize the data to handle BigInt values
    const serializedResults = serializeData(formattedResults);

    return new NextResponse(JSON.stringify(serializedResults), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Error fetching results" },
      { status: 500 }
    );
  }
}
