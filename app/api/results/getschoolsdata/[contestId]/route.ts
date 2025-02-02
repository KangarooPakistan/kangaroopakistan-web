import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Helper function to safely serialize BigInt values

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; contestId: string } }
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

    // Combine school details with result count
    const schoolsWithDetails = schoolDetails.map((school) => {
      const resultCount =
        schoolsWithResultCount.find((s) => s.schoolId === school.schoolId)
          ?._count._all ?? 0;
      return {
        ...school,
        resultCount,
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
