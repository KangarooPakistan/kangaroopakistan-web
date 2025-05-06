import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    // First, get all schools that have results for this contest
    const schoolsWithResults = await db.result.groupBy({
      by: ["schoolId"],
      where: {
        contestId: params.contestId,
      },
      _count: {
        _all: true,
      },
    });

    // Get all the bronze medal counts in a single query
    const bronzeCounts = await db.result.groupBy({
      by: ["schoolId", "class"],
      where: {
        contestId: params.contestId,
        AwardLevel: "BRONZE",
      },
      _count: {
        _all: true,
      },
    });

    // Get school details
    const schoolDetails = await db.user.findMany({
      where: {
        schoolId: {
          in: schoolsWithResults.map((s) => s.schoolId),
        },
      },
      select: {
        schoolId: true,
        schoolName: true,
        district: true,
        city: true,
        schoolAddress: true,
        contactNumber: true,
        email: true,
      },
    });

    // Process the data to calculate junior and senior bronze counts
    const schoolsWithDetails = schoolDetails.map((school) => {
      const resultCount =
        schoolsWithResults.find((s) => s.schoolId === school.schoolId)?._count
          ._all ?? 0;

      // Filter bronze counts for this school
      const schoolBronzeCounts = bronzeCounts.filter(
        (count) => count.schoolId === school.schoolId
      );

      // Calculate junior bronze count (class 1-4)
      const juniorBronzeCount = schoolBronzeCounts
        .filter((count) => count.class >= 1 && count.class <= 4)
        .reduce((total, current) => total + current._count._all, 0);

      // Calculate senior bronze count (class 5-12)
      const seniorBronzeCount = schoolBronzeCounts
        .filter((count) => count.class >= 5 && count.class <= 12)
        .reduce((total, current) => total + current._count._all, 0);

      return {
        ...school,
        resultCount,
        juniorBronzeCount,
        seniorBronzeCount,
      };
    });

    return NextResponse.json(schoolsWithDetails, { status: 200 });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(error, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
