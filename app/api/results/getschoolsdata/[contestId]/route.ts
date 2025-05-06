import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { contestId: string } }
) {
  try {
    // Get schools with result count
    const schoolsWithResultCount = await db.result.groupBy({
      by: ["schoolId"],
      where: {
        contestId: params.contestId,
      },
      _count: {
        _all: true,
      },
    });

    // Get bronze medal counts for junior (class 1-4) and senior (class 5-12) students
    const bronzeMedalCounts = await Promise.all(
      schoolsWithResultCount.map(async (school) => {
        const juniorBronzeCount = await db.result.count({
          where: {
            contestId: params.contestId,
            schoolId: school.schoolId,
            class: { in: [1, 2, 3, 4] },
            AwardLevel: "BRONZE", // Using AwardLevel from your schema
            level: "JUNIOR", // Using the level enum from your schema
          },
        });

        const seniorBronzeCount = await db.result.count({
          where: {
            contestId: params.contestId,
            schoolId: school.schoolId,
            class: { in: [5, 6, 7, 8, 9, 10, 11, 12] },
            AwardLevel: "BRONZE", // Using AwardLevel from your schema
            level: "SENIOR", // Using the level enum from your schema
          },
        });

        return {
          schoolId: school.schoolId,
          juniorBronzeCount,
          seniorBronzeCount,
        };
      })
    );

    // Get school details for these schoolIds
    const schoolDetails = await db.user.findMany({
      where: {
        schoolId: {
          in: schoolsWithResultCount.map((school) => school.schoolId),
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

    // Combine school details with result count and bronze medal counts
    const schoolsWithDetails = schoolDetails.map((school) => {
      const resultCount =
        schoolsWithResultCount.find((s) => s.schoolId === school.schoolId)
          ?._count._all ?? 0;

      const bronzeCounts = bronzeMedalCounts.find(
        (s) => s.schoolId === school.schoolId
      ) || { juniorBronzeCount: 0, seniorBronzeCount: 0 };

      return {
        ...school,
        resultCount,
        juniorBronzeCount: bronzeCounts.juniorBronzeCount,
        seniorBronzeCount: bronzeCounts.seniorBronzeCount,
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
