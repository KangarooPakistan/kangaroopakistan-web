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

    // Get junior bronze counts (using the level enum)
    const juniorBronzeCounts = await db.result.groupBy({
      by: ["schoolId"],
      where: {
        contestId: params.contestId,
        AwardLevel: "BRONZE",
        level: "JUNIOR",
      },
      _count: {
        _all: true,
      },
    });

    // Get senior bronze counts (using the level enum)
    const seniorBronzeCounts = await db.result.groupBy({
      by: ["schoolId"],
      where: {
        contestId: params.contestId,
        AwardLevel: "BRONZE",
        level: "SENIOR",
      },
      _count: {
        _all: true,
      },
    });

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

    // Combine school details with result count and bronze counts
    const schoolsWithDetails = schoolDetails.map((school) => {
      const resultCount =
        schoolsWithResultCount.find((s) => s.schoolId === school.schoolId)
          ?._count._all ?? 0;

      const juniorBronzeCount =
        juniorBronzeCounts.find((s) => s.schoolId === school.schoolId)?._count
          ._all ?? 0;

      const seniorBronzeCount =
        seniorBronzeCounts.find((s) => s.schoolId === school.schoolId)?._count
          ._all ?? 0;

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
